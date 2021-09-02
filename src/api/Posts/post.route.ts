import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { postController } from "./post.controller";

const Route = Router();

Route.route("/").get(AuthModule.isAuthenticatedUser);

Route.route("").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({}),
    })
);

export default Route;
