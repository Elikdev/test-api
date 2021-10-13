import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { verificationMiddleware } from "../../middlwares/checkLogin";
import { requestService } from "./request.services";


const requestRouter = Router()


requestRouter.post('/new-request', verificationMiddleware.validateToken, async(req:Request, res:Response)=>{
    try{
        const authUser = (req as any).user
        const response = await requestService.createRequest({id:authUser.id,...req.body})
        successRes(res, response)
    }catch(error){
        errorResponse(res, error.message, 404 )
    }
})


export default requestRouter;