import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { industryService } from "./industry.service"
import { industryValidation } from "../../middlwares/validations/industry.validation"
import { verificationMiddleware } from "../../middlwares/checkLogin"

const industryRouter = Router()

industryRouter.post(
  "/update",
  verificationMiddleware.validateToken,
  industryValidation.addIndustryValidation(),
  async (req: Request, res: Response) => {
    try {
      const interestDTO = req.body.industries
      if (!interestDTO) {
        return errorResponse(res, "no data entered", 400)
      }
      const authUser = (req as any).user

      //service is being called here
      const response = await industryService.addUserIndustries(authUser, interestDTO)

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

industryRouter.post(
  "/get-all",
  verificationMiddleware.validateToken,
  async (req: Request, res: Response) => {
    try {
      const response = industryService.getAllIndustries()
      if (!response.status) {
        return errorResponse(res, "error occured. try again", 400)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)

export default industryRouter
