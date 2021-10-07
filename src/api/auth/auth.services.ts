import { getRepository } from "typeorm"
import {BaseService} from "../../helpers/db.helper"
import {AccountType} from  "../../utils/enum"
import {AuthModule} from "../../utils/auth"
import {Fan} from "../fan/fan.model"
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


      delete user.password
      console.log(email_sent)
      return this.internalResponse(true, user, 200, "Sign up successful")
 }

 public async verifyOtp(userDTO: {
  otp_code: string
 }) {
  return this.internalResponse(true, userDTO.otp_code, 200, "otp verified")
 }
}

export const authService = new AuthService()
