import { Request, Response } from "express"
import { errorResponse, successRes } from "../../utils/response"
import { Message } from "./message.model"
import { messageService } from "./message.service"

class MessageController {
    async getMessage(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const response = await messageService.getMessage(authuser)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async newMessage(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const chatDTO = req.body
            const response = await messageService.newMessage(authuser, chatDTO)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }
}

export const messageController = new MessageController()
