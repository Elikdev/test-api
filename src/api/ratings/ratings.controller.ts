import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { ratingService } from "./ratings.services"
import { ratingValidation } from "../../middlwares/validations/rating.validation"
import { verificationMiddleware } from "../../middlwares/checkLogin"

const ratingRouter = Router()

ratingRouter.post(
  "/new/:influencerId",
  verificationMiddleware.validateToken,
  ratingValidation.rateInfluencerValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      const influencerId = parseInt((req.params as any).influencerId)
      
      if(authUser.id === influencerId){
        return errorResponse(res, "User can not rate self", 400)
      }

      //service is being called here
      const response = await ratingService.newRating(authUser, {
        ...req.body,
        influencerId,
      })

      if (!response.status) {
        return errorResponse(res, response.message, 400)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)
export default ratingRouter
