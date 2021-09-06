
import { Router } from "express";


import { AuthModule } from "../../utils/auth";
import { followController } from "./follow.controller";



const Route = Router()

Route.route('/follow/:userId')

    .post(

        AuthModule.isAuthenticatedUser,
        followController.follow
    )

Route.route('/:userId')
    .get(
        AuthModule.isAuthenticatedUser,
        followController.getAllFollowers
    )

export default Route;