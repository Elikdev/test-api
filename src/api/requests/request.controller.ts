import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { verificationMiddleware } from "../../middlwares/checkLogin";
import { requestValidation } from "../../middlwares/validations/request.validation";
import { requestService } from "./request.services";


const requestRouter = Router()


requestRouter.post('/new-request', verificationMiddleware.validateToken, requestValidation.newRequest(),  async(req:Request, res:Response)=>{
    try {
        const authUser = (req as any).user
        const {influencer} = req.body
        if(authUser.id === influencer){
            return errorResponse(res, "can't make request for self", 400)
        }

        const response = await requestService.createRequest(authUser, req.body)
    
          if (!response.status) {
            return errorResponse(res, response.message, 400)
          }
    
          return successRes(res, response.data, response.message)
    } catch(error) {
        if (error?.email_failed) {
            return errorResponse(
              res,
              "Error in sending email. Contact support for help",
              400
            )
        }
        return errorResponse(res, "an error occured, contact support", 500)
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

requestRouter.post('/view-requests', verificationMiddleware.validateToken,  async(req:Request, res:Response)=>{
    try {
        const authUser = (req as any).user

        const response = await requestService.getAllRequestForAUser(authUser.id)
    
        if (!response.status) {
            return errorResponse(res, response.message, 400)
        }
    
        return successRes(res, response.data, response.message)
    } catch(error) {
        if (error?.email_failed) {
            return errorResponse(
              res,
              "Error in sending email. Contact support for help",
              400
            )
        }
        return errorResponse(res, "an error occured, contact support", 500)
    }
})

export default requestRouter;