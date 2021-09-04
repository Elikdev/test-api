import { Request, Response } from "express";
import { successRes, errorResponse } from "../../utils/response";
import { followService } from "./follow.service";
class FollowerController {
    async follower(req: Request, res: Response) {
        try {
            const followedid = parseInt(req.params.followedid)
            const authuser = (req as any).user
            if (authuser.id === followedid) {
                return errorResponse(res, "user can not follow self", 400)
            }
            const response = await followService.follow(authuser, followedid)
            if (response.data === "following") {
                return errorResponse(res, "already following", 409)
            }
            return successRes(res, response.data)
        } catch (error) {
            console.log(error)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }
}
export const followController = new FollowerController()