import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { commentController } from "./comment.controller";

const Route = Router();

Route.route("/new/:postId").post(
    AuthModule.isAuthenticatedUser, 
    celebrate({
        body: Joi.object({
            content: Joi.string().required()
        }),
        params: Joi.object({
            postId: Joi.number().required()
        })
    }),
    commentController.addNewComment
    );

Route.route("/edit/:postId/:commentId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({
            content: Joi.string().required()
        }),
        params: Joi.object({
            postId: Joi.number().required(),
            commentId: Joi.number().required()
        })
    }),
    commentController.editComment
);

export default Route;
