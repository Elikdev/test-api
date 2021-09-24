import { celebrate } from "celebrate"
import { Router } from "express"
import Joi from "joi"
import { AuthModule } from "../../utils/auth"
import { chatController } from "./chat.controller"
import { MediaType } from "../../enums"

const Route = Router()

Route.route("/all").post(
    AuthModule.isAuthenticatedUser,
    chatController.getChats
)

Route.route("/get-chat/:chatId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            chatId: Joi.number().required(),
        }),
    }),
    chatController.getChat
)

Route.route("/new/:userId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            userId: Joi.number().required(),
        }),
    }),
    chatController.newChat
)

Route.route("/update-chat/:chatId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({
            blocked: Joi.boolean().optional(),
            open: Joi.boolean().optional(),
        }),
        params: Joi.object({
            chatId: Joi.number().required(),
        }),
    }),
    chatController.updateChat
)

Route.route("/delete-chat/:chatId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            chatId: Joi.number().required(),
        }),
    }),
    chatController.deleteChat
)

export default Route
