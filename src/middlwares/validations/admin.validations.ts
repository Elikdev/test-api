import { celebrate } from "celebrate";
import Joi from "joi";
import { LiveVideoVerificationStatus } from "../../utils/enum";

class AdminValidation {
  public verifyLiveVideoRules() {
    return celebrate({
      body: Joi.object({
        influencerId: Joi.number().required(),
        verify_video: Joi.valid(
          LiveVideoVerificationStatus.DECLINED,
          LiveVideoVerificationStatus.VERIFIED
        ).required(),
      }),
    })
  }

  public updateAdminStatusRules() {
    return celebrate({
      params: {
        adminId: Joi.number().required(),
      },
      query: {
        type: Joi.valid(
          "deactivate",
          "activate",
          "delete",
          "restore"
        ).required(),
      },
    })
  }
}

export const adminValidation = new AdminValidation()
