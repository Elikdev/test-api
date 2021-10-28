import { query, Router, Request, Response } from "express";
import { successRes, errorResponse} from "../../helpers/response.helper";
import { userService } from "../user/user.services"


const tempRouter = Router()


tempRouter.delete('/delete-user/:id', async(req:Request, res:Response)=>{
    try{
        const {id} = req.params
        const response = await userService.tempDeleteUser(id)
        successRes(res, response)
    }catch(error){
        errorResponse(res, error.message, 500)
    }
})
export default tempRouter