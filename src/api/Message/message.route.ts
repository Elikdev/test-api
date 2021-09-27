import { celebrate } from "celebrate"
import { Router } from "express"
import Joi from "joi"
import { AuthModule } from "../../utils/auth"
import { MessageType } from "../../enums"
import { messageController } from "./message.controller"

const Route = Router()

Route.route("/get-all/:chatId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            chatId: Joi.number().required(),
        }),
    }),
    messageController.getAllMessages
)

Route.route("/:chatId/new").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            chatId: Joi.number().required(),
        }),
        body: Joi.object({
            content: Joi.string().required(),
            type: Joi.valid(
                MessageType.IMAGE,
                MessageType.VIDEO,
                MessageType.TEXT
            ).required(),
        }),
    }),
    messageController.newMessage
)

Route.route("/delete-message/:messageId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            messageId: Joi.number().required(),
        }),
    }),
    messageController.deleteMesssage
)

export default Route
