import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../helpers/response.helper";
import { AuthModule } from "../utils/auth";
import { userService } from "../api/user/user.services";

class VerificationMiddleware {
  public validateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization
    let token: string
    if (!authHeader) return errorResponse(res, "Unauthorized", 401)

    //separate the Bearer from the string if it exists
    const separateBearer = authHeader.split(" ")
    if (separateBearer.includes("Bearer")) {
      token = separateBearer[1]
    } else {
      token = authHeader
    }

    try {
      const grantAccess = AuthModule.verifyToken(token)
      const { userDetails, verified } = grantAccess
      if (!verified) {
        return errorResponse(res, "Unauthorized", 401)
      }
      
      (req as any).user = await userService.getUserDetails(userDetails.id)

      return next()
    } catch (err) {
      console.log(`Error from token verification >> `, err)
      if (err?.name === "TokenExpiredError") {
        return errorResponse(res, "Unauthorized. Token expired", 401)
      }
      if (err?.name === "JsonWebTokenError") {
        return errorResponse(res, "Unauthorized. Invalid token format.", 401)
      }
      return errorResponse(
        res,
        "Something went wrong, please try again later.",
        500
      )
    }
  }

  public checkCeleb = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = (req as any).user

    if (user.account_type.toLowerCase() !== "celebrity") {
      return errorResponse(
        res,
        "Unauthorized. Function not available for your account type",
        401
      )
    }else{
        return next()
    }

  }
}

export const verificationMiddleware = new VerificationMiddleware()
