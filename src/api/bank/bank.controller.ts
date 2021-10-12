import { query, Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { bankService } from "./bank.services"
import { bankValidation } from "../../middlwares/validations/bank.validation"
import { verificationMiddleware } from "../../middlwares/checkLogin"

const bankRouter = Router()

bankRouter.post(
  "/get-bank-account-details",
  verificationMiddleware.validateToken,
  bankValidation.getBankAccountValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await bankService.getBankAccount(authUser, req.body)

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

bankRouter.post(
  "/add-bank-details",
  verificationMiddleware.validateToken,
  bankValidation.addBankDetailsValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await bankService.addBankDetails(authUser, req.body)

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

bankRouter.post(
  "/get-bank/:bankId",
  verificationMiddleware.validateToken,
  bankValidation.getBankDetailsValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      const bankId = parseInt(req.params.bankId as any)

      //service is being called here
      const response = await bankService.getBank(authUser, { bankId })

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

bankRouter.post(
  "/get-banks",
  verificationMiddleware.validateToken,
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await bankService.getBanks(authUser)

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

export default bankRouter
