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

messageRouter.post(
  "/messages-by-roomid",
  verificationMiddleware.validateToken,
  async (req: Request, res: Response) => {
    try {

      const room_id = (req.body as any).room_id

      if(!room_id) {
        return errorResponse(res,  "room_id is required", 400)
      }
      //service is being called 
      const response = await messageService.getMessagesInARoom(room_id)

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

messageRouter.post(
  "/save-new-message",
  messageValidation.newMessageValidation(),
  async (req: Request, res: Response) => {
    try {
      //service is being called 
      const response = await messageService.newMessage(req.body)

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