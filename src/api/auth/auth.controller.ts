import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import {authService} from "./auth.services"
import {authValidation} from "../../middlwares/validations/auth.validation"

const authRouter = Router();

authRouter.post("/sign-up",  authValidation.signUpValidation(), async (req: Request, res: Response) => {
  try {
    //service is being called here
    const response =  await authService.signup(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    if (error?.email_failed) {
      return errorResponse(res, 'Error in sending email. Contact support for help', 400)
    }
    return errorResponse(res, 'an error occured, contact support', 500)
  }
});

authRouter.post("/verify-otp", authValidation.verifyOtpValidation(), async (req: Request, res: Response) => {
  try {
    const response =  await authService.verifyOtp(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    return errorResponse(res, 'an error occured, contact support', 500)
  }
})

export default authRouter;
