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

  public setPinValidation() {
    return celebrate({
      body: Joi.object({
        pin: Joi.string().min(4).max(4).required(),
        confirm_pin: Joi.any()
          .equal(Joi.ref("pin"))
          .required()
          .label("Confirm pin")
          .options({ messages: { "any.only": "{{#label}} must match pin" } }),
      }),
    })
  }
  
  public changePinValidation() {
    return celebrate({
      body: Joi.object({
        old_pin: Joi.string().min(4).max(4).required(),
        new_pin: Joi.string().min(4).max(4).optional(),
        confirm_pin: Joi.any()
          .equal(Joi.ref("new_pin"))
          .optional()
          .label("Confirm pin")
          .options({ messages: { "any.only": "{{#label}} must match new_pin" } }),
      }),
    })
  }
}

export const userValidation = new UserValidation();
