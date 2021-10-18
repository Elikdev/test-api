import { celebrate } from "celebrate";
import Joi from "joi";

class RatingValidation {
  public rateInfluencerValidation() {
    return celebrate({
      params: {
        influencerId: Joi.number().required(),
      },
      body: Joi.object({
       rating: Joi.number().max(5).required(),
       review_message: Joi.string().optional()
      })
    });
  }
}

export const ratingValidation = new RatingValidation();
