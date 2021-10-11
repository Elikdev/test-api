import { celebrate } from "celebrate";
import Joi from "joi";

class UserValidation {
  public updateProfileValidation() {
    return celebrate({
      body: {
        profile_image: Joi.string().uri().optional(),
        bio: Joi.string().optional(),
      },
    });
  }

  public changePasswordValidation() {
    return celebrate({
      body: {
        old_password: Joi.string().required(),
        new_password: Joi.string().min(8).invalid(Joi.ref("old_password")).required(),
        confirm_password: Joi.any()
          .equal(Joi.ref("new_password"))
          .required()
          .label("Confirm password")
          .options({ messages: { "any.only": "{{#label}} must match new password" } }),
      },
    });
  }
}

export const userValidation = new UserValidation();
