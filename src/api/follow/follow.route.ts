
import { Router } from "express";


import { AuthModule } from "../../utils/auth";
import { followController } from "./follow.controller";



const Route = Router()

Route.route('/follow/:followedid')

    .post(

        AuthModule.isAuthenticatedUser,
        followController.follower
    )

export default Route;