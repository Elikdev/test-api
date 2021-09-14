import { celebrate } from "celebrate"
import { Router } from "express"
import Joi from "joi"
import { AuthModule } from "../../utils/auth"
import { messageController } from "./message.controller"

const Route = Router()

Route.route("/").post(
    AuthModule.isAuthenticatedUser,
    messageController.getMessage
)

Route.route("/new").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({}),
    }),
    messageController.getMessage
)

export default Route
