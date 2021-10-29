import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { messageService } from "./messages.service"
import { messageValidation } from "../../middlwares/validations/message.validation"
import { verificationMiddleware } from "../../middlwares/checkLogin"
import { IncomingMessage } from "../../utils/enum"

const messageRouter = Router()

messageRouter.post(
  "/new-messages",
  messageValidation.newMessageSetValidation(),
  async (req: Request, res: Response) => {
    try {
      const messageDTO = req.body.messages as IncomingMessage[]
      if (!messageDTO) {
        return errorResponse(res, "no data entered", 400)
      }

      //service is being called here
      const response = await messageService.newSetOfMessages(messageDTO)

      if (!response.status) {
        return errorResponse(res, response.message, 400, response.data)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)

export default messageRouter