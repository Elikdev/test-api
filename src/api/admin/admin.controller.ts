import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { verificationMiddleware } from "../../middlwares/checkLogin"
import {adminService} from "./admin.services"

const adminRouter = Router()



adminRouter.post(
 "/dashboard",
 verificationMiddleware.validateToken,
 verificationMiddleware.checkAdmin,
 async (req: Request, res: Response) => {
   try {

     //service is being called here
     const response = await adminService.adminDashboard()

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

adminRouter.post(
 "/get-influencers-content",
 verificationMiddleware.validateToken,
 verificationMiddleware.checkAdmin,
 async (req: Request, res: Response) => {
   try {

     //service is being called here
     const response = await adminService.influencersContent()

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


adminRouter.post(
  "/get-fans-content",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
 
      //service is being called here
      const response = await adminService.fansContent()
 
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

export default adminRouter