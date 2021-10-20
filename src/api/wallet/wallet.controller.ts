import { query, Router, Request, Response } from "express";
import { successRes, errorResponse } from "../../helpers/response.helper";
import { walletService } from "./wallet.services";
import { walletValidation } from "../../middlwares/validations/wallet.validation";
import { verificationMiddleware } from "../../middlwares/checkLogin";

const walletRouter = Router();

walletRouter.post(
  "/fund-wallet",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkFan,
  walletValidation.fundWalletValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user;

      //service is being called here
      const response = await walletService.fundFanWallet(authUser, req.body);

      if (!response.status) {
        return errorResponse(res, response.message, 400);
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

export default walletRouter;
