import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { userService } from "./user.services"
import {userValidation} from "../../middlwares/validations/user.validation"
import {verificationMiddleware} from "../../middlwares/checkLogin"

const userRouter = Router();

userRouter.post(
  "/update-profile",
  verificationMiddleware.validateToken,
  userValidation.updateProfileValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await userService.updateProfile(authUser, req.body)

      if (!response.status) {
        return errorResponse(res, response.message, 400)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      if (error?.email_failed) {
        return errorResponse(
          res,
          "Error in sending email. Contact support for help",
          400
        )
      }
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)

userRouter.post(
  "/change-password",
  verificationMiddleware.validateToken,
  userValidation.changePasswordValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await userService.changePassword(authUser, req.body)

      if (!response.status) {
        return errorResponse(res, response.message, 400)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      if (error?.email_failed) {
        return errorResponse(
          res,
          "Error in sending email. Contact support for help",
          400
        )
      }
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)

export default userRouter