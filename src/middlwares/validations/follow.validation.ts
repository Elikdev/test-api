import { celebrate } from "celebrate";
import Joi from "joi";

class FollowValidation {
  public followInfluencerValidation() {
    return celebrate({
      params: {
        userId: Joi.number().required(),
      },
    });
  }
}

export const followValidation = new FollowValidation();
