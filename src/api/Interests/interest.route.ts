import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { interestController } from "./interest.controller";


const Route = Router()

Route.route('/')
    .get(
        AuthModule.isAuthenticatedUser,
        interestController.getInterests
    )
    .post(
        AuthModule.isAuthenticatedUser,
        celebrate({
            body: Joi.object({
                interests:Joi.array().items({
                    name: Joi.string().required() ,
                    slug: Joi.string().required()
                })
            })
        }),
        interestController.addInterest 
    )

export default Route;