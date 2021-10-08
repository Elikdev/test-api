import { celebrate } from "celebrate";
import Joi from "joi";
import { AccountType } from "../../utils/enum";

class AuthValidation {
 public signUpValidation(){
  return celebrate({
   body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    handle: Joi.string().required(),
    password: Joi.string().min(8).required(),
    phone_number: Joi.string().min(10).pattern(/^([0]{1}|\+?[234]{3})([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/).required().messages({"string.pattern.base": "Invalid phone number"}),
    country_code: Joi.number().required(),
    account_type: Joi.valid(AccountType.CELEB, AccountType.FAN, AccountType.ADMIN),
    social_media_link: Joi.string().uri().optional()
   })
  })
 }

 public verifyOtpValidation() {
  return celebrate({
   body: Joi.object({
    otp_code: Joi.string().min(6).required(),
    email: Joi.string().email().required()
   })
  })
 }

 public forgotPasswordValidation(){
  return celebrate({
   body: Joi.object({
    email: Joi.string().email().required()
   })
  })
 }

 public resetPasswordValidation(){
  return celebrate({
   body: Joi.object({
    otp_code: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    new_passwword: Joi.string().email().required()
   })
  })
 }

 public signInValidation(){
    return celebrate({
     body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
     })
    })
   }
}

export const authValidation = new AuthValidation()
