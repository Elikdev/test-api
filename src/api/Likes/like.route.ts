import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { likeController } from "./like.controller";

const Route = Router();

Route.route("/").post(
    AuthModule.isAuthenticatedUser, 
    celebrate({
        query: Joi.object({
            postId: Joi.number().optional()
        }),
    }),
    likeController.getAllLikes
);

Route.route("/post/:postId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            postId: Joi.number().required()
        }),
    }),
    likeController.likeAndUnlike
);

export default Route;
