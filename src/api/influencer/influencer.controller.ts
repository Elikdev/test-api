import {Router, Request, Response} from "express"
import { successRes, errorResponse } from "../../helpers/response.helper"
import { influencerService } from "./influencer.services"
import { verificationMiddleware } from "../../middlwares/checkLogin"
import { influencerValidation } from "../../middlwares/validations/influencer.validation"

const influencerRouter = Router()

influencerRouter.get('/find-influencer', verificationMiddleware.validateToken, async (req: Request, res: Response)=>{
  try{
        const {search} =req.query
    if(typeof search !== 'string'){
        errorResponse(res, 'search parameter must be a string')
        return 
    }
    const response = await influencerService.findInfluencer(search.toString())
    successRes(res,response)
  }catch(error){
      errorResponse(res, error.message)
  }
})

influencerRouter.put('/set-rate', verificationMiddleware.validateToken, verificationMiddleware.checkCeleb, influencerValidation.setRates(), async (req: Request, res: Response)=>{
  try{
    const {type,amount, id} = req.body
    const response = await influencerService.setRate(type, amount, id)
    successRes(res,response)
  }catch(error){
    errorResponse(res, error.message)
  }
})

influencerRouter.post('/get-all', verificationMiddleware.validateToken, async (req: Request, res: Response)=>{
  try{
    const authUser = (req as any).user

    const page = req.query.page ? parseInt((req.query as any).page) : 1
    const limit = req.query.limit ? parseInt((req.query as any).limit) : 15

    //service is being called here
    const response = await influencerService.getAllInfluencers(authUser, {page, limit})

    if (!response.status) {
      return errorResponse(res, response.message, 400)
    }

    return successRes(res, response.data, response.message)
  }catch(error){
    console.log(error)
    return errorResponse(res, "an error occured, contact support", 500)
  }
})


influencerRouter.post(
  "/find-one/:id",
  verificationMiddleware.validateToken,
  influencerValidation.getOneInfluencerValidation(),
  async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user

      const id =  parseInt(req.params.id as any)

      //service is being called here
      const response = await influencerService.getOneInfluncer(authUser, { id })

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





export default influencerRouter