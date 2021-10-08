import { getRepository } from "typeorm"
import {BaseService} from "../../helpers/db.helper"
import {AccountType} from  "../../utils/enum"
import {AuthModule} from "../../utils/auth"
import {Fan} from "../fan/fan.model"
import { User } from "../user/user.model"
import {Influencer} from "../influencer/influencer.model"
import { sendEmail, compileEjs } from "../../helpers/mailer.helper"
import {userService} from '../user/user.services'
import { influencerService } from "../influencer/influencer.services"
import { walletService } from "../wallet/wallet.services"
import { fanService } from "../fan/fan.services"

class AuthService extends BaseService {

    super: any

    public async signup(userDTO: {
      full_name: string
      handle: string
      email: string
      password: string
      phone_number: string,
      country_code: number,
      social_media_link: string,
      live_video: string,
      account_type: AccountType
    }) {
      const emailToLower = userDTO.email.toLowerCase();
      const user_exists =  await userService.findOneUser(userDTO.handle, emailToLower, userDTO.phone_number) 
      

      //if the user_exists, return error
      if(user_exists){
      let message: string
      if(user_exists.email === emailToLower){
        message = "Email already exists"
      } 
      
      if (user_exists.handle === userDTO.handle) {
        message = "Username has been taken already"
      }

      if (user_exists.phone_number === userDTO.phone_number) {
        message = "Phone number already exists"
      }

      return this.internalResponse(false, {}, 400, message)
      }

      let user: Influencer | Fan
      //hash the password
      const hashedPassword = AuthModule.hashPassWord(userDTO.password)
      //if account type is fan or influencer
      if(userDTO.account_type === AccountType.CELEB){
      //
      
    const celeb = influencerService.newinfluencerInstance(
    userDTO.full_name,
    hashedPassword,
    emailToLower,
    userDTO.handle,
    userDTO.country_code,
    userDTO.phone_number,
    userDTO?.social_media_link,
    userDTO?.live_video
    )
      // if the celeb account is successfully created
      //create wallet
      walletService.newWalletInstance(celeb)

      
      user = await influencerService.createInfluencer(celeb)


      if(user) {
          await walletService.createWallet(user)
      }
      }

      if (userDTO.account_type === AccountType.FAN){

      user = await fanService.newFan(
        userDTO.full_name,
        hashedPassword,
        emailToLower,
        userDTO.handle,
        userDTO.country_code,
        userDTO.phone_number
      )
      }

      //if everything goes well
      // generate otp
      const otp: string = AuthModule.generateOtp(6);
      const expiry_time: string =  new Date(Date.now() + 600000).toString()

      //send email to user
      const htmlMessage = compileEjs({ template: "code-template" })({
        first_title: "Email Verification",
        second_title: " ",
        name: `${Array.isArray(userDTO.full_name.split(" ")) ? userDTO.full_name.split(" ")[0] : userDTO.full_name}`,
        code: otp,
      });

      const email_sent = await sendEmail({
        html: htmlMessage,
        subject: "Bamiki Account Registration",
        to: emailToLower,
      })
      

      //find the user
      user.email_verification = {otp_code: otp, expires_in: expiry_time}

      await this.save(User, user)

      delete user.password
      delete user.email_verification
      console.log(email_sent)
      return this.internalResponse(true, user, 200, "Sign up successful")
 }

 public async verifyOtp(userDTO: {
  otp_code: string,
  email: string
 }) {

    const emailToLower = userDTO.email.toLowerCase()
    //if user is registered
    const user_exists = await userService.findUserWithOtp(emailToLower, userDTO.otp_code)
  
    if(!user_exists){
      return this.internalResponse(false, {}, 400, "Invalid email")
    }
  
    //if the user has been verified
    if(user_exists.is_verified) {
      return this.internalResponse(false, {}, 400, "You have been verified initially")
    }
  
    //if the code has expired
    if(new Date(Date.now()) >= new Date(user_exists.email_verification.expires_in)){
      return this.internalResponse(false, {}, 400, "The OTP code entered has expired")
    }
  
    //if the code is invalid
    if(userDTO.otp_code !== user_exists.email_verification.otp_code){
      return this.internalResponse(false, {}, 400, "Invalid OTP code")
    }
  
    //successful... email verified
    const update_details = {
      is_verified: true,
      email_verification: {otp_code: null, expires_in: null}
    }
  
    this.schema(User).merge(user_exists, update_details)
  
    await this.updateOne(User, user_exists)
  
    
    return this.internalResponse(true, {}, 200, "otp verified")

 }

 public async forgotPassword(userDTO: { email: string }) {
  const emailToLower = userDTO.email.toLowerCase()

   //check if the email is registered
   const user_exists = await userService.findUserWithEmail(emailToLower)

   if(!user_exists) {
     return this.internalResponse(false, {}, 400, "Invalid email")
   }

   //check if the user has been verified
   if(!user_exists.is_verified) {
     return this.internalResponse(false, {}, 400, "Verify your account to proceed")
   } 

   //send a code to the email
  // generate otp
   const otp: string = AuthModule.generateOtp(6);
   const expiry_time: string =  new Date(Date.now() + 600000).toString() // 10mins

   //send email to user
   const htmlMessage = compileEjs({ template: "code-template" })({
     first_title: "Reset Password",
     second_title: " ",
     name: `${Array.isArray(user_exists.full_name.split(" ")) ? user_exists.full_name.split(" ")[0] : user_exists.full_name}`,
     code: otp,
    });

    const email_sent = await sendEmail({
      html: htmlMessage,
      subject: "Request to Reset Password",
      to: emailToLower,
    })
    
    if(!email_sent) {
      return this.internalResponse(true, {}, 400, "Error in sending email")
    }

    user_exists.email_verification =  { otp_code: otp, expires_in: expiry_time }

    await this.save(User, user_exists)
    
    return this.internalResponse(true, {}, 200, "A code has been sent to your email")
 }

 public async resetPassword(userDTO: { email: string, otp_code: string, new_password } ) {
   //search for the user
   const user_exists = await userService.findUserWithOtp(userDTO.email.toLowerCase(), userDTO.otp_code)

   if(!user_exists){
     return this.internalResponse(false, {}, 400, "invalid email")
   }

  //if the code has expired
   if(new Date(Date.now()) >= new Date(user_exists.email_verification.expires_in)){
    return this.internalResponse(false, {}, 400, "The OTP code entered has expired")    
   } 

  //if the code is invalid
  if(userDTO.otp_code !== user_exists.email_verification.otp_code){
   return this.internalResponse(false, {}, 400, "Invalid OTP code")
  }

  //hashPassword
  const hashedPassword = AuthModule.hashPassWord(userDTO.new_password)

  //reset the email_verification
  const update_details = {
    password: hashedPassword,
    email_verification: {otp_code: null, expires_in: null}
  }

  this.schema(User).merge(user_exists, update_details)

  await this.updateOne(User, user_exists)

  return this.internalResponse(true, {}, 200, "Password changed successully")
 }

 public async signIn(userDTO: {
  email: string;
  password: string
 }) {
  const emailToLower = userDTO.email.toLowerCase();
  const user_exists = await userService.findUserWithEmail(emailToLower);
  if (!user_exists) {
    return this.internalResponse(
      false,
      {},
      400,
      "Incorrect Email or Password!"
    )
  }

  if(!user_exists.is_verified) {
    return this.internalResponse(false, { email: user_exists.email }, 401, "The email that you entered has not been verified")
  }

  // add this and update the usertable with migration
  // if (user_exists.status === "disabled") {
  //   return this.internalResponse(false, {}, 400, "Your account has been disabled. Contact Support")
  // }

  const isPasswordValid = AuthModule.compareHash(userDTO.password, user_exists.password);
  if (!isPasswordValid) {
    return this.internalResponse(
      false,
      {},
      400,
      "Incorrect Email or Password!"
    )
  }

  // update the last login date AND add this to the user table
  const update_details = { last_login: new Date(Date.now()) }
  const result = await userService.updateUser(user_exists, update_details);
  const { password, ...data } = result

  const token = AuthModule.generateJWT({
    id: user_exists.id,
    email: user_exists.email,
    full_name: user_exists.full_name,
    handle: user_exists.handle,
  })

  console.log("hh", result)
  
  return this.internalResponse(true, { data, token }, 200, "User login successful")
 }

}

export const authService = new AuthService()
