import { getRepository } from "typeorm"
import {BaseService} from "../../helpers/db.helper"
import {AccountType} from  "../../utils/enum"
import {AuthModule} from "../../utils/auth"
import {User} from "../user/user.model"
import {Fan} from "../fan/fan.model"
import {Influencer} from "../influencer/influencer.model"
import { sendEmail, compileEjs } from "../../helpers/mailer.helper"
import {Wallet} from  "../wallet/wallet.model"

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
  const user_exists =  await getRepository(User).findOne({
   where: [
    { handle: userDTO.handle },
    { email: emailToLower },
    { phone_number: userDTO.phone_number}
   ]
  })

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
   const celeb = new Influencer()
   celeb.full_name = userDTO.full_name
   celeb.password = hashedPassword
   celeb.email = emailToLower
   celeb.handle = userDTO.handle
   celeb.country_code = userDTO.country_code
   celeb.phone_number =  userDTO.phone_number
   celeb.social_media_link = userDTO?.social_media_link
   celeb.live_video = userDTO?.live_video

  // if the celeb account is successfully created
   //create wallet
   const celeb_wallet = new Wallet()
   celeb_wallet.wallet_balance = 0
   celeb_wallet.ledger_balance = 0
   celeb_wallet.influencer = celeb

   const celebRepository = getRepository(Influencer)
   user = await celebRepository.save(celeb)


   let wallet: Wallet
   if(user) {
    wallet = await this.create(Wallet, {
     wallet_balance: 0,
     ledger_balance: 0,
     influencer: user
    })

    await this.save(Wallet, wallet)
   }
  }

  if (userDTO.account_type === AccountType.FAN){
   const fan =  new Fan()
   fan.full_name = userDTO.full_name
   fan.password = hashedPassword
   fan.email = emailToLower
   fan.handle = userDTO.handle
   fan.country_code = userDTO.country_code
   fan.phone_number = userDTO.phone_number

   const fanRepository = getRepository(Fan)

  user = await fanRepository.save(fan)
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
  console.log(email_sent, "ggg")
  return this.internalResponse(true, user, 200, "Sign up successful")
 }

 public async verifyOtp(userDTO: {
  otp_code: string
 }) {
  return this.internalResponse(true, userDTO.otp_code, 200, "otp verified")
 }
}

export const authService = new AuthService()
