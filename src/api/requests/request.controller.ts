import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { verificationMiddleware } from "../../middlwares/checkLogin";
import { requestValidation } from "../../middlwares/validations/request.validation";
import { requestService } from "./request.services";


const requestRouter = Router()


requestRouter.post('/new-request', verificationMiddleware.validateToken, requestValidation.newRequest(),  async(req:Request, res:Response)=>{
    try{
        const authUser = (req as any).user
        const {influencer} = req.body
        if(authUser.id === influencer){
            throw new Error('cant make request to self')
        }
        const response = await requestService.createRequest({fan:authUser.id,...req.body})
        successRes(res, response)
    }catch(error){
        errorResponse(res, error.message, 404 )
    }
})

requestRouter.post('/respond-to-request', verificationMiddleware.validateToken, verificationMiddleware.checkCeleb, requestValidation.updateRequest(), async(req:Request, res:Response)=>{
    try{
        const authUser = (req as any).user
        const response = await requestService.respondToRequest({influencer:authUser.id, ...req.body})
        successRes(res, response)
    }catch(error){
        errorResponse(res, error.message, 404 )
    }
})


export default requestRouter;