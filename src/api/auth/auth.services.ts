import { getRepository } from "typeorm"
import {BaseService} from "../../helpers/db.helper"
import { AccountType } from '../../utils/enum';
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

      let user: any
      let isFan: boolean
      
      //hash the password
      const hashedPassword = AuthModule.hashPassWord(userDTO.password)

      //if account type is fan or influencer
      if(userDTO.account_type === AccountType.CELEB){
        isFan = false
        user = influencerService.newInfluencerInstance(
        userDTO.full_name,
        hashedPassword,
        emailToLower,
        userDTO.handle,
        userDTO.country_code,
        userDTO.phone_number,
        userDTO?.social_media_link,
        userDTO?.live_video,
        userDTO.account_type,
        )
      }

      if (userDTO.account_type === AccountType.FAN){
        isFan = true
        user = await fanService.newFan(
        userDTO.full_name,
        hashedPassword,
        emailToLower,
        userDTO.handle,
        userDTO.country_code,
        userDTO.phone_number,
        userDTO.account_type,
      )
      }

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

      if(email_sent) {
        if(!isFan){
          walletService.newWalletInstance(user)

          user = await influencerService.createInfluencer(user)
  
          if(user) {
              await walletService.createWallet(user)
          }
        }else {
          user = await fanService.createFan(user)
        }
      }

      //update the user
      user.email_verification = {otp_verified: false, otp_code: otp, expires_in: expiry_time}

      await userService.saveUser(user)

      delete user.password
      delete user.email_verification
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
          return this.internalResponse(false, {}, 400, "Invalid email/otp entered")
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
          email_verification: {otp_verifed: false, otp_code: null, expires_in: null}
        }
      
        this.schema(User).merge(user_exists, update_details)
      
        await this.updateOne(User, user_exists)
      
        
        return this.internalResponse(true, {}, 200, "OTP verified")

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

      user_exists.email_verification =  { otp_verified: false, otp_code: otp, expires_in: expiry_time }

      await userService.saveUser(user_exists)
      
      return this.internalResponse(true, {}, 200, "A code has been sent to your email")
  }




  public async verifyForgotPasswordOtp(userDTO: {email: string, otp_code: string}) {
    const emailToLower = userDTO.email.toLowerCase()

    //check if the email is registered
    const user_exists = await userService.findUserWithOtp(emailToLower, userDTO.otp_code)

    if(!user_exists) {
      return this.internalResponse(false, {}, 400, "Invalid email/otp entered")
    }

    //verify otp
    //if the code has expired
    if(new Date(Date.now()) >= new Date(user_exists.email_verification.expires_in)){
      return this.internalResponse(false, {}, 400, "The OTP code entered has expired")    
    } 

    //if the code is invalid
    if(userDTO.otp_code !== user_exists.email_verification.otp_code){
      return this.internalResponse(false, {}, 400, "Invalid OTP code")
    }

    user_exists.email_verification = { otp_verified: true, otp_code: null, expires_in: user_exists.email_verification.expires_in }

    await userService.saveUser(user_exists)

    return this.internalResponse(true, {}, 200, "OTP verified")
  }




 public async resetPassword(userDTO: { email: string, new_password: string, confirm_password: string } ) {
   //search for the user
   const user_exists = await userService.findUserWithEmail(userDTO.email.toLowerCase())

   if(!user_exists){
     return this.internalResponse(false, {}, 400, "Invalid email")
   }

   if(!user_exists.email_verification.otp_verified) {
     return this.internalResponse(false, {email: user_exists.email}, 400, "You need to verify an OTP code that has been sent to your email")
   }

   //if the code has expired
   if(new Date(Date.now()) >= new Date(user_exists.email_verification.expires_in)){
     return this.internalResponse(false, { email: user_exists.email }, 400, "Access denied, Request for a new OTP code")    
   } 

   if(userDTO.new_password !== userDTO.confirm_password){
     return this.internalResponse(false, {}, 400, "Passwords do not match")
   }

   //hashPassword
   const hashedPassword = AuthModule.hashPassWord(userDTO.new_password)

   //reset the email_verification
   const update_details = {
     password: hashedPassword,
     email_verification: { otp_verified: false, otp_code: null, expires_in: null }
   }

   await userService.updateUser(user_exists, update_details)

   return this.internalResponse(true, {}, 200, "Password reset successfully")
 }




 public async resendOtp(userDTO: {email: string}){
  const emailToLower = userDTO.email.toLowerCase()

  //check if the email is registered
  const user_exists = await userService.findUserWithEmail(emailToLower)

  if(!user_exists) {
    return this.internalResponse(false, {}, 400, "Incorrect email")
  }

  //resend code to the email
  // generate otp
  const otp: string = AuthModule.generateOtp(6);
  const expiry_time: string =  new Date(Date.now() + 600000).toString() // 10mins

  //send email to user
  const htmlMessage = compileEjs({ template: "code-template" })({
    first_title: "Resend OTP",
    second_title: " ",
    name: `${Array.isArray(user_exists.full_name.split(" ")) ? user_exists.full_name.split(" ")[0] : user_exists.full_name}`,
    code: otp,
   });

   const email_sent = await sendEmail({
     html: htmlMessage,
     subject: "Resend OTP",
     to: emailToLower,
   })
   
   if(!email_sent) {
     return this.internalResponse(true, {}, 400, "Error in sending email")
   }

   user_exists.email_verification =  {otp_verified: false, otp_code: otp, expires_in: expiry_time }

   await userService.saveUser(user_exists)

   return this.internalResponse(true, {}, 200, "OTP code has been sent to your email")

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

  if (user_exists.account_type === "celebrity") {
    const influencer = await influencerService.findInfluencerWithEmail(emailToLower)
    // send back the email for client to redirect to video upload screen
    if (!influencer?.is_admin_verified && influencer?.live_video == null ) {
      return this.internalResponse(false, { email: user_exists.email }, 401, "Video verification required")
    }

    if (user_exists.account_type === "celebrity" && !influencer?.is_admin_verified && influencer?.live_video != null ) {
      return this.internalResponse(false, { email: user_exists.email }, 401, "Your account is awaiting approval")
    }
  }


  // add this and update the usertable with migration
  if (user_exists.status === "disabled") {
    return this.internalResponse(false, {}, 400, "Your account has been disabled. Contact Support")
  }

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
  
  return this.internalResponse(true, { data, token }, 200, "User login successful")
 }

 public async uploadVideo(userDTO: {email: string, video_link: string}) {
  const emailToLower = userDTO.email.toLowerCase()

  // check if you are an influencer
  const influencer = await influencerService.findInfluencerWithEmail(emailToLower);
  if (!influencer || influencer.account_type !== "celebrity") {
    return this.internalResponse(false, {}, 400, "This function is not available for you")
  }

  if (influencer.is_admin_verified) {
    return this.internalResponse(false, {}, 400, "Your account has already been approved")
  }

  const update_details = { live_video: userDTO.video_link }

  // send mail to user that its received
  const message = compileEjs({ template: "update-template" })({
    body: `Your video verification has been received.
    This may take a while as we are experiencing a larger than normal volume of requests recently and we are working through them as quickly as we can in order 
    they are received.<br>
    We would get back to you in due time 🚀.
    `,
    name: `${Array.isArray(influencer.full_name.split(" ")) ? influencer.full_name.split(" ")[0] : influencer.full_name}`,
  });
  const sent_mail = await sendEmail({
    html: message,
    subject: "Bamiki Influencer Video Verification",
    to: emailToLower,
  });
  
  if(!sent_mail) {
    return this.internalResponse(true, {}, 400, "Error in sending email")
  }
  // update the user then
  const result = await influencerService.updateInfluencer(influencer, update_details);

  if (!result) {
    return this.internalResponse(false, {}, 400, "Unable to upload video for verification")
  }

  delete result.password

  return this.internalResponse(true, { }, 200, "Video uploaded successfully, Account pending approval")
  }

  public async verifyVideo(userDTO: {id: number}) {
    const influencer = await influencerService.findInfluencerById(userDTO.id);
    if (!influencer || influencer.account_type !== "celebrity") {
      return this.internalResponse(false, {}, 400, "This function is not available for you")
    }
  
    if (influencer.is_admin_verified) {
      return this.internalResponse(false, {}, 400, "Account has already been approved")
    }
  
    if (influencer.live_video == null) {
      return this.internalResponse(false, {}, 400, "No video available for the user yet")
    }

    const update_details = { is_admin_verified: true }
  
    // // send mail to user that its received
    const message = compileEjs({ template: "update-template" })({
      body: `Hurray🚀. Your account has been approved. Login and start posting on bamiki today.
      `,
      name: `${Array.isArray(influencer.full_name.split(" ")) ? influencer.full_name.split(" ")[0] : influencer.full_name}`,
    });
    const sent_mail = await sendEmail({
      html: message,
      subject: "Bamiki Influencer Video Verification Successful",
      to: influencer.email,
    });
    
    if(!sent_mail) {
      return this.internalResponse(true, {}, 400, "Error in sending email")
    }
    // // update the user then
    const result = await influencerService.updateInfluencer(influencer, update_details);

    if (!result) {
      return this.internalResponse(false, {}, 400, "Unable to update user")
    }
    
    delete result.password
  
    return this.internalResponse(true, { data: result }, 200, "Account approved")
  }
    
}

export const authService = new AuthService()
