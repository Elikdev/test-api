import { Request, Response } from "express"
import { errorResponse, successRes } from "../../utils/response"
import { Chat } from "./chat.model"
import { chatService } from "./chat.service"

class ChatController {
    async getChat(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const response = await chatService.getChat(authuser)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async newChat(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const chatDTO = req.body
            const response = await chatService.newChat(authuser, chatDTO)
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

export const chatController = new ChatController()
