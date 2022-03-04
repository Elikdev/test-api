import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { roomService } from "./room.service"
import { messageValidation } from "../../middlwares/validations/message.validation"
import { verificationMiddleware } from "../../middlwares/checkLogin"
import { IncomingMessage } from "../../utils/enum"

const roomRouter = Router()

roomRouter.post(
  "/create-room-for-help-support",
  verificationMiddleware.validateToken,
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await roomService.createRoomForHelpAndSupport(parseInt(authUser.id))

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

roomRouter.post(
  "/get-rooms-for-admin",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {

      //service is being called here
      const response = await roomService.getRoomAdminExistsIn()

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

export default roomRouter