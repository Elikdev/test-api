import {Router} from "express";
import {successRes} from "../../utils/response";


const userRouter = Router()

userRouter.route('/').get((req, res) => {
    successRes(res, {}, 'success', 200)
})