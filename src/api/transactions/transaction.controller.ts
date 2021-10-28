import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { transactionService } from "./transaction.services"
import {transactionValidation} from "../../middlwares/validations/transaction.validation"
import {verificationMiddleware} from "../../middlwares/checkLogin"

const transactionRouter = Router();


transactionRouter.post(
  "/get-all",
  verificationMiddleware.validateToken,
  transactionValidation.getAllValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      const limit = parseInt(req.query.limit as any) || 15
      const page = parseInt(req.query.page as any) || 1

      //service is being called here
      const response =
        await transactionService.getUsersAndInfluencersTransactions(authUser, {
          limit: limit,
          page: page,
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

transactionRouter.post(
  "/:transactionId",
  verificationMiddleware.validateToken,
  transactionValidation.getOneValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      const transactionId = parseInt(req.params.transactionId as any)

      //service is being called here
      const response =
        await transactionService.getUsersAndInfluencersTransaction(authUser, {
          transactionId,
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

export default transactionRouter;