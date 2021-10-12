import {Router, Request, Response} from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { influencerService } from "./influencer.services"
import { verificationMiddleware } from "../../middlwares/checkLogin"

const influencerRouter = Router()

influencerRouter.get('/find-influencer', verificationMiddleware.validateToken, async (req: Request, res: Response)=>{
    console.log(req.query.search)
    const response = await influencerService.findAll()
    successRes(res,response)
})

export default influencerRouter