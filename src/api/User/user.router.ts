import { celebrate } from "celebrate";
import {Router} from "express";
import Joi from "joi";
import { AccountType } from "../../enums";
import {userController} from "./user.controller";


const userRouter = Router()

userRouter.route('/sign-up')
    // sign up
    .post( 
        celebrate({
            body: Joi.object({
                account_type: Joi.allow(AccountType.FAN, AccountType.CELEB, AccountType.ADMIN).required(),
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
                email: Joi.string().email().required(),
                phone: Joi.string().required(),
                user_name: Joi.string().required(),
                password: Joi.string().required()
            })
        }),
        userController.signUp
    )

userRouter.route('/login')
    .post(celebrate({
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    }),
    userController.signIn
)


export { userRouter }