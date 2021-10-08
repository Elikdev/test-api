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

authRouter.post("/forgot-password", authValidation.forgotPasswordValidation(), async (req: Request, res: Response) => {
  try {
    const response =  await authService.forgotPassword(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    return errorResponse(res, 'an error occured, contact support', 500)
  }
})

authRouter.post("/forgot-password/verify-otp", authValidation.verifyOtpValidation(), async (req: Request, res: Response) => {
  try {
    const response =  await authService.verifyForgotPasswordOtp(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    return errorResponse(res, 'an error occured, contact support', 500)
  }
})


authRouter.post("/reset-password", authValidation.resetPasswordValidation(), async (req: Request, res: Response) => {
  try {
    const response =  await authService.resetPassword(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400, response.data)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    return errorResponse(res, 'an error occured, contact support', 500)
  }
})

authRouter.post("/resend-otp", authValidation.forgotPasswordValidation(), async (req: Request, res: Response) => {
  try {
    const response =  await authService.resendOtp(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)

  } catch (error) {
    console.log(error)
    return errorResponse(res, 'an error occured, contact support', 500)
  }
})

authRouter.post("/sign-in",  authValidation.signInValidation(), async (req: Request, res: Response) => {
  try {
    //service is being called here
    const response =  await authService.signIn(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400, response.data)
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

authRouter.post("/upload-video",  authValidation.uploadVideoValidation(), async (req: Request, res: Response) => {
  try {
    //service is being called here
    const response =  await authService.uploadVideo(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400, response.data)
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

// custom route just for testing sake till we do admin part
authRouter.post("/verify-video",  authValidation.verifyVideoValidation(), async (req: Request, res: Response) => {
  try {
    //service is being called here
    const response =  await authService.verifyVideo(req.body)

    if (!response.status) {
      return errorResponse(res, response.message, 400, response.data)
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
export default authRouter;
