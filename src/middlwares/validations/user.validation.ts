import { celebrate } from "celebrate";
import Joi from "joi";

class UserValidation {
 public updateProfileValidation() {
  return celebrate({
   body: {
    full_name: Joi.string().optional(),
    phone_number: Joi.string().min(10).pattern(/^([0]{1}|\+?[234]{3})([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/).optional().messages({"string.pattern.base": "Invalid phone number"}),
    country_code: Joi.number().optional(),
    social_media_link: Joi.string().uri().optional()
   }
  })
 }
}

export const userValidation = new UserValidation()