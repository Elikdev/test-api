import { Request, Response } from "express"
import { errorResponse, successRes } from "../../utils/response"
import { Chat } from "./chat.model"
import { chatService } from "./chat.service"

class ChatController {
    async getChat(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const chatId = parseInt(req.params.chatId as any)
            const response = await chatService.getChat(authuser, {chatId})
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async getChats(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const response = await chatService.getChats(authuser)
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
            const userId = parseInt(req.params.userId as any)
            const response = await chatService.newChat(authuser, {user_2: userId})
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async updateChat(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const chatId = parseInt(req.params.chatId as any)
            let chatDTO = req.body
            const response = await chatService.updateChat(authuser, {...chatDTO, chatId})
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async deleteChat(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const chatId = parseInt(req.params.chatId as any)
            const response = await chatService.deleteChat(authuser, {chatId})
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
