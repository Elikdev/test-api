import { getRepository } from "typeorm"
import {BaseService} from "../../helpers/db.helper"
import { RoleType } from '../../utils/enum';
import {AuthModule} from "../../utils/auth"
import { User } from "../user/user.model"
import { sendEmail, compileEjs } from "../../helpers/mailer.helper"
import {userService} from '../user/user.services'
import { fanService } from "../fan/fan.services"
import { RefreshToken } from "./refreshToken.model";
import {v4 as uuidv4} from "uuid"

class AuthService extends BaseService {

    super: any

    public async signup(userDTO: {
      full_name: string
      handle: string
      email: string
      password: string
      phone_number: string,
      country_code: number,
    }) {
      const emailToLower = userDTO.email.toLowerCase()
      const user_exists = await userService.findOneUser(
        userDTO.handle,
        emailToLower,
        userDTO.phone_number
      )

      //if the user_exists, return error
      if (user_exists) {
        let message: string
        if (user_exists.email === emailToLower) {
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

      //hash the password
      const hashedPassword = AuthModule.hashPassWord(userDTO.password)

      user = await fanService.newFan(
          userDTO.full_name,
          hashedPassword,
          emailToLower,
          userDTO.handle,
          userDTO.country_code,
          userDTO.phone_number,
        )

      // generate otp
      const otp: string = AuthModule.generateOtp(6)
      const expiry_time: string = new Date(Date.now() + 600000).toString()

      //send email to user
      const htmlMessage = compileEjs({ template: "code-template" })({
        first_title: "Email Verification",
        second_title: " ",
        name: `${
          Array.isArray(userDTO.full_name.split(" "))
            ? userDTO.full_name.split(" ")[0]
            : userDTO.full_name
        }`,
        code: otp,
      })

      const email_sent = await sendEmail({
        html: htmlMessage,
        subject: "Test API Account Registration",
        to: emailToLower,
      })

      if (email_sent) {
          user = await fanService.createFan(user)

        //update the user
        user.email_verification = {
          otp_verified: false,
          otp_code: otp,
          expires_in: expiry_time,
        }

        const user_created = await userService.saveUser(user)

        if (!user_created) {
          return this.internalResponse(false, {}, 400, "Error in saving user")
        }

        delete user.password
        delete user.email_verification
        return this.internalResponse(true, user, 200, "Sign up successful")
      }
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
      "Incorrect Email address"
    )
  }

  if(!user_exists.is_verified) {
    return this.internalResponse(false, { email: user_exists.email }, 401, "The email that you entered has not been verified")
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
      "Incorrect Password!"
    )
  }

  // update the last login date AND add this to the user table
  const update_details = { last_login: new Date(Date.now()) }
  const result = await userService.updateUser(user_exists, update_details);
  const { password, ...data } = result
  
  let token: any

    token = AuthModule.generateJWT({
      id: user_exists.id,
      email: user_exists.email,
      full_name: user_exists.full_name,
      handle: user_exists.handle,
    })
  
  // get data
  const userDetails = await userService.aggregateUserDetails(user_exists.id, user_exists.account_type);

  
  return this.internalResponse(true, { data: userDetails, token }, 200, "User login successful")
 }

  // public async createRefreshToken (user: any, expires: number, token: string) {
  //   let expiry_time = new Date(Date.now() + expires)

  //   //find if there is an existing one
  //   const rt_exists = await this.findOne(RefreshToken, {
  //     where: { user: user.id },
  //   })

  //   if (rt_exists) {
  //     const update_fields = {
  //       token: token,
  //       expires_in: expiry_time,
  //     }
  //     const update_token = this.schema(RefreshToken).merge(
  //       rt_exists,
  //       update_fields
  //     )
  //     return await this.updateOne(RefreshToken, update_token)
  //   } else {
  //     const new_token = getRepository(RefreshToken).create({
  //       token,
  //       expires_in: expiry_time,
  //       user,
  //     })

  //     return this.save(RefreshToken, new_token)
  //   }
  // }

  // public async refreshToken (rtDTO: {token: string, userId: number}) {
  //   const {token, userId} = rtDTO

  //   if(!token || !userId) {
  //     return this.internalResponse(false, {}, 400, "Both token and user id are required")
  //   }

  //   const token_exists = await this.findOne(RefreshToken, {
  //     where: {user: userId}
  //   })

  //   if(!token_exists) {
  //     return this.internalResponse(false, {}, 400, "Please make a new signin request because token does not exist")
  //   }

  //   if(new Date(token_exists.expires_in) < new Date(Date.now())) {
  //     return this.internalResponse(false, {}, 400, "Please make a new signin request because token has expired")
  //   }

  //   const user_exists = await userService.findUserWithId(userId)
    
  //   if(!user_exists){
  //     return this.internalResponse(false, {}, 400, "Please make a new signin request because user does not exist")
  //   }

  //   const access = AuthModule.generateAccessToken(
  //     {
  //       id: user_exists.id,
  //       email: user_exists.email,
  //       full_name: user_exists.full_name,
  //       handle: user_exists?.handle || "bamiki-admin",
  //     },
  //     300 //5mins
  //   )

  //   const refresh = uuidv4()
    
  //   //update the token
  //   const token_updated = await this.createRefreshToken(user_exists,  604800000, refresh) // 7 days --  604800000

  //   if(!token_updated) {
  //     return this.internalResponse(false, {}, 400, "error in updating the admin token")
  //   }

  //   //remove password
  //   const {password, email_verification, ...data} = user_exists

  //   const response = {
  //     userDetails: data,
  //     token: {
  //       refresh,
  //       access
  //     }
  //   }

  //   return this.internalResponse(true, response, 200, "Token refreshed")
  // }

  public async setToAdmin (userId: number) {
    const user_exists = await userService.findUserWithId(userId)

    if(!user_exists) {
      return this.internalResponse(false, {}, 400, "user does not exist")
    }

    //update user
    const update_details = {
      role: RoleType.BAMIKI_ADMIN
    }

    const user_updated = userService.updateUser(user_exists, update_details)

    if(!user_updated) {
      return this.internalResponse(false, {}, 400, "error in updating user")
    }

    return this.internalResponse(true, {}, 200, "User updated")
  }
    
}

export const authService = new AuthService()
