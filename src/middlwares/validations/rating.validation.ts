import { celebrate } from "celebrate";
import Joi from "joi";
import { RequestType } from "../../utils/enum";

class RatingValidation {
  public rateInfluencerValidation() {
    return celebrate({
      params: {
        influencerId: Joi.number().required(),
      },
      body: Joi.object({
       rating: Joi.number().min(0).max(5).required(),
       review_message: Joi.string().optional(),
       request_type: Joi.valid(RequestType.DM, RequestType.SHOUT_OUT).required()
      })
    });
  }
}

export const ratingValidation = new RatingValidation();
