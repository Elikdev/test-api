import { Router, Request, Response } from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { verificationMiddleware } from "../../middlwares/checkLogin"
import {adminService} from "./admin.services"
import { adminValidation } from "../../middlwares/validations/admin.validations"

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

 adminRouter.post(
  "/get-verification-content",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
 
      //service is being called here
      const response = await adminService.verificationContent()
 
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
  "/verify-live-video",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  adminValidation.verifyLiveVideoRules(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      //service is being called here
      const response = await adminService.verifyLiveVideoForInfluencer(authUser, req.body)
 
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
  "/get-all-admins",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
 
      //service is being called here
      const response = await adminService.getAllAdmins()
 
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
  "/transactions-settings",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const type = (req.query as any).type
      const authUser = (req as any).user

      //service is being called here
      const response = await adminService.setTransactionSettings(authUser, {...req.body, type})
 
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
  "/add-admin",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await adminService.addNewAdmin(authUser, req.body)
 
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
  "/edit-admin",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      //service is being called here
      const response = await adminService.editAdminProfile(authUser, req.body)
 
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
  "/update-admin/:adminId",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  adminValidation.updateAdminStatusRules(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user
      const type = (req.query as any).type
      const adminId = parseInt((req.params as any).adminId)

      //service is being called here
      const response = await adminService.updateAdminStatus(authUser, {type, adminId})
 
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
  "/get-settings",
  verificationMiddleware.validateToken,
  verificationMiddleware.checkAdmin,
  async (req: Request, res: Response) => {
    try {

      //service is being called here
      const response = await adminService.getTransactionSettings()
 
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