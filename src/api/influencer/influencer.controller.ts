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

export default influencerRouter