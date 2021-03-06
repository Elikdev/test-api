// import { Router, Request, Response } from "express"
// import { successRes, errorResponse } from "../../helpers/response.helper"
// import { verificationMiddleware } from "../../middlwares/checkLogin"
// import {adminService} from "./admin.services"
// import { adminValidation } from "../../middlwares/validations/admin.validations"
// import multerHelper from "../../middlwares/multerHelper"

// const adminRouter = Router()

// const campaignUpload = multerHelper.single("recipient_file")


// adminRouter.post(
//  "/dashboard",
//  verificationMiddleware.validateToken,
//  verificationMiddleware.checkAdmin,
//  async (req: Request, res: Response) => {
//    try {

//      //service is being called here
//      const response = await adminService.adminDashboard()

//      if (!response.status) {
//        return errorResponse(res, response.message, 400)
//      }

//      return successRes(res, response.data, response.message)
//    } catch (error) {
//      console.log(error)
//      return errorResponse(res, "an error occured, contact support", 500)
//    }
//  }
// )

// adminRouter.post(
//  "/get-influencers-content",
//  verificationMiddleware.validateToken,
//  verificationMiddleware.checkAdmin,
//  async (req: Request, res: Response) => {
//    try {

//      //service is being called here
//      const response = await adminService.influencersContent()

//      if (!response.status) {
//        return errorResponse(res, response.message, 400)
//      }

//      return successRes(res, response.data, response.message)
//    } catch (error) {
//      console.log(error)
//      return errorResponse(res, "an error occured, contact support", 500)
//    }
//  }
// )


// adminRouter.post(
//   "/get-fans-content",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
 
//       //service is being called here
//       const response = await adminService.fansContent()
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/get-verification-content",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
 
//       //service is being called here
//       const response = await adminService.verificationContent()
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/verify-live-video",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   adminValidation.verifyLiveVideoRules(),
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user
//       //service is being called here
//       const response = await adminService.verifyLiveVideoForInfluencer(authUser, req.body)
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )


//  adminRouter.post(
//   "/get-all-admins",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
 
//       //service is being called here
//       const response = await adminService.getAllAdmins()
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/transactions-settings",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
//       const type = (req.query as any).type
//       const authUser = (req as any).user

//       //service is being called here
//       const response = await adminService.setTransactionSettings(authUser, {...req.body, type})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/add-admin",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user

//       //service is being called here
//       const response = await adminService.addNewAdmin(authUser, req.body)
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )


//  adminRouter.post(
//   "/edit-admin",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user

//       //service is being called here
//       const response = await adminService.editAdminProfile(authUser, req.body)
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/update-admin/:adminId",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   adminValidation.updateAdminStatusRules(),
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user
//       const type = (req.query as any).type
//       const adminId = parseInt((req.params as any).adminId)

//       //service is being called here
//       const response = await adminService.updateAdminStatus(authUser, {type, adminId})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/get-settings",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {

//       //service is being called here
//       const response = await adminService.getTransactionSettings()
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/new-email-campaign",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//    campaignUpload,
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user      

//       const recipient_file = req.file

//       // if(!recipient_file) {
//       //   return errorResponse(res, "Upload a file to proceed", 400)
//       // }
//       //service is being called here
//       const response = await adminService.newEmailCampaign(authUser, {...req.body, recipient_file})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

 
//  adminRouter.post(
//   "/new-sms-campaign",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   campaignUpload,
//   async (req: Request, res: Response) => {
//     try {
//       const authUser = (req as any).user      

//       const recipient_file = req.file

//       // if(!recipient_file) {
//       //   return errorResponse(res, "Upload a file to proceed", 400)
//       // }
//       //service is being called here
//       const response = await adminService.newSmsCampaign(authUser, {...req.body, recipient_file})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )


//  adminRouter.post(
//   "/search-filter",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   async (req: Request, res: Response) => {
//     try {
//       let  {field, value, filter, page, limit} = req.query as any     

//       page = parseInt(page) || 1
//       limit = parseInt(limit) || 25
//       //service is being called here
//       const response = await adminService.searchAndFilter({field, value, filter, page, limit})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//   "/get-campaigns",
//   verificationMiddleware.validateToken,
//   verificationMiddleware.checkAdmin,
//   adminValidation.getCampaignsRules(),
//   async (req: Request, res: Response) => {
//     try {
//       let  {type} = req.query as any     
//       //service is being called here
//       const response = await adminService.getCampaigns({type})
 
//       if (!response.status) {
//         return errorResponse(res, response.message, 400)
//       }
 
//       return successRes(res, response.data, response.message)
//     } catch (error) {
//       console.log(error)
//       return errorResponse(res, "an error occured, contact support", 500)
//     }
//   }
//  )

//  adminRouter.post(
//    "/find-admin",
//    verificationMiddleware.validateToken,
//    verificationMiddleware.checkAdmin,
//    async (req: Request, res: Response) => {
//      try {
//        const id_1 = (req.body as any).id_1
//        const id_2 = (req.body as any).id_2

//        if (!id_1 || !id_2) {
//          return errorResponse(res, "2 valid Ids are required", 400)
//        }
//        //service is being called here
//        const response = await adminService.findAdminBasedOnIds({
//          id_1: parseInt(id_1),
//          id_2: parseInt(id_2),
//        })

//        if (!response.status) {
//          return errorResponse(res, response.message, 400)
//        }

//        return successRes(res, response.data, response.message)
//      } catch (error) {
//        console.log(error)
//        return errorResponse(res, "an error occured, contact support", 500)
//      }
//    }
//  )

// export default adminRouter