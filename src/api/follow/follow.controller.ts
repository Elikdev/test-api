import { query, Router, Request, Response } from "express";
import { successRes, errorResponse } from "../../helpers/response.helper";
import { followService } from "./follow.service";
import { followValidation } from "../../middlwares/validations/follow.validation";
import { verificationMiddleware } from "../../middlwares/checkLogin";

const followRouter = Router();

followRouter.post(
  "/follow/:userId",
  verificationMiddleware.validateToken,
  followValidation.followInfluencerValidation(),
  async (req: Request, res: Response) => {
    try {
      const followedId = parseInt(req.params.userId);

      const authUser = (req as any).user;
      if (authUser.id === followedId) {
        return errorResponse(res, "user can not follow self", 400);
      }

      const response = await followService.follow(authUser, followedId);
      if (!response.status) {
        return errorResponse(res, response.message, response.statusCode);
      }

      return successRes(res, response.data, response.message);
    } catch (error) {
      console.log(error);
      if (error?.email_failed) {
        return errorResponse(
          res,
          "Error in sending email. Contact support for help",
          400
        );
      }
      return errorResponse(res, "an error occured, contact support", 500);
    }
  }
);

export default followRouter;
