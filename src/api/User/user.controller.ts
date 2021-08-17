import {Request, Response} from "express";
import {userService} from "./user.services";
import {errorResponse, successRes} from "../../utils/response";

class UserControllers {
    public async getUserDetails( req: Request, res: Response ) {
        const response = await userService.getUser(req.body.user.id)
        if(!response.status){
            return errorResponse(res, response.message, response.statusCode)
        }
        return  successRes(res, response.data)
    }

    public async signUp (req: Request, res: Response){
        try {
            const userDTO = req.body;
            const response = await userService.SignUp(userDTO)
            if(!response.status){
                return errorResponse(res, response.message, response.statusCode)
            }
            return  successRes(res, response.data)
        }catch (e){
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }
}

export const userController = new UserControllers()