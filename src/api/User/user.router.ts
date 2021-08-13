import {Router} from "express";
import {userController} from "./user.controller";


const userRouter = Router()

userRouter.route('/')
    // sign up
    .post(userController.signUp)

userRouter.route('/')
    .post()