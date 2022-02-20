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
            return errorResponse(res, response.message, 400, response.data)
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

requestRouter
    .post(
        '/respond-to-request/:requestId', 
        verificationMiddleware.validateToken, 
        verificationMiddleware.checkCeleb, 
        requestValidation.updateRequest(), 
        async (req: Request, res: Response) => {
        try {
            const authUser = (req as any).user
            const response = await requestService.respondToRequest(
                authUser,
                { ...req.body, requestId: req.params.requestId }
            )
                
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
    }
)

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

requestRouter
    .post(
        '/cancel-request/:requestId', 
        verificationMiddleware.validateToken,
        requestValidation.cancelRequest(), 
        async (req: Request, res: Response) => {
        try {
            const authUser = (req as any).user
            const { requestId } = req.params
            const response = await requestService.cancelRequest(authUser, Number(requestId))
                
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
    }
)


requestRouter.post(
  "/save-shout-out-video",
  verificationMiddleware.validateToken,
  requestValidation.saveShoutVideo(),
  async (req: Request, res: Response) => {
    try {
      const response = await requestService.saveShoutOutVideos(req.body)

      if (!response.status) {
        return errorResponse(res, response.message, 400)
      }

      return successRes(res, response.data, response.message)
    } catch (error) {
      console.log(error)
      return errorResponse(res, "an error occured, contact support", 500)
    }
  }
)

requestRouter.post(
    "/get-all-shout-out-videos",
    verificationMiddleware.validateToken,
    async (req: Request, res: Response) => {
      try {
        const response = await requestService.getAllShoutOutVideos()
  
        if (!response.status) {
          return errorResponse(res, response.message, 400)
        }
  
        return successRes(res, response.data, response.message)
      } catch (error) {
        console.log(error)
        return errorResponse(res, "an error occured, contact support", 500)
      }
    }
  )

  requestRouter.post(
    "/get-all-shout-out-videos-for-user",
    verificationMiddleware.validateToken,
    async (req: Request, res: Response) => {
      try {
        const authUser = (req as any).user
        const response = await requestService.getAllShoutOutVideosForUser(
          authUser
        )

        if (!response.status) {
          return errorResponse(res, response.message, 400)
        }

        return successRes(res, response.data, response.message)
      } catch (error) {
        console.log(error)
        return errorResponse(res, "an error occured, contact support", 500)
      }
    }
  )

  requestRouter.post(
    "/get-all-shout-out-videos-for-an-influencer/:influencerId",
    verificationMiddleware.validateToken,
    requestValidation.getShoutOutByInfluencer(),
    async (req: Request, res: Response) => {
      try {
        const { influencerId } = req.params
        const response = await requestService.getAllShoutOutVideosByInfluencer(
          Number(influencerId)
        )

        if (!response.status) {
          return errorResponse(res, response.message, 400)
        }

        return successRes(res, response.data, response.message)
      } catch (error) {
        console.log(error)
        return errorResponse(res, "an error occured, contact support", 500)
      }
    }
  )

export default requestRouter;
