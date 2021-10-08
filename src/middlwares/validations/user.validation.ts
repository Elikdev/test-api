import { celebrate } from "celebrate";
import Joi from "joi";

class UserValidation {
 public updateProfileValidation() {
  return celebrate({
   body: {
    profile_image: Joi.string().uri().optional(),
    bio: Joi.string().optional()
   }
  })
 }
}

export const userValidation = new UserValidation()