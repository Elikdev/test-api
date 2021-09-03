import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { postController } from "./post.controller";
import {MediaType} from "../../enums"

const Route = Router();

Route.route("/get/:shortUrl").post(
    AuthModule.isAuthenticatedUser,     
    celebrate({
        params: Joi.object({
            shortUrl:  Joi.string().required(),
        }),
    }), 
    postController.getPostViaUrl
);

Route.route("/").post(AuthModule.isAuthenticatedUser, postController.getPostsByUser);

Route.route("/new").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({
            title:  Joi.string().required(),
            content: Joi.string().required(),
            media: Joi.array().min(1).items(Joi.object({
                url: Joi.string().required(),
                type: Joi.valid(MediaType.IMAGE, MediaType.VIDEO).required()
            }))
        }),
    }),
    postController.addNewPost
);

Route.route("/delete/:postId").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        params: Joi.object({
            postId:  Joi.string().required(),
        }),
    }),
    postController.deletePost
);

export default Route;
