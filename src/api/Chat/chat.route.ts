import { celebrate } from "celebrate"
import { Router } from "express"
import Joi from "joi"
import { AuthModule } from "../../utils/auth"
import { chatController } from "./chat.controller"
import { MediaType } from "../../enums"

const Route = Router()

Route.route("/").post(AuthModule.isAuthenticatedUser, chatController.getChat)

Route.route("/new").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({}),
    }),
    chatController.newChat
)

export default Route
