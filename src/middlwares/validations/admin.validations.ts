import { celebrate } from "celebrate";
import Joi from "joi";
import { LiveVideoVerificationStatus } from "../../utils/enum";

class AdminValidation { 
 public verifyLiveVideoRules() {
  return celebrate({
   body: Joi.object({
    influencerId: Joi.number().required(),
    verify_video: Joi.valid(LiveVideoVerificationStatus.DECLINED, LiveVideoVerificationStatus.VERIFIED).required()
   })
  })
 } 
}

export const adminValidation = new AdminValidation()
