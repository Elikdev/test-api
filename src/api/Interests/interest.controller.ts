import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Interest } from "./interest.model";
import { interestService } from "./interest.service";

class InterestController {
    getInterests(req: Request, res: Response) {
        const response = interestService.getAllInterests()
        return successRes(res, response.data)
    }

    async addInterest(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const interestDTO = req.body.interests 
            const response = await interestService.addUserInterests(authuser, interestDTO )
            if(!response.status){
                return errorResponse(res, response.message, response.statusCode)
            }
            return  successRes(res, response.data)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    // async 
}


export const interestController = new InterestController()