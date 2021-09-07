import { Request, Response } from "express";
import { successRes, errorResponse } from "../../utils/response";
import { followService } from "./follow.service";
class FollowerController {
    async follow(req: Request, res: Response) {
        try {
            const followedid = parseInt(req.params.userId)
            const authuser = (req as any).user
            if (authuser.id === followedid) {
                return errorResponse(res, "user can not follow self", 400)
            }
            const response = await followService.follow(authuser, followedid)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data)
        } catch (error) {

            return errorResponse(res, "an error occured contact support", 500)
        }
    }
    async getAllFollowers(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId)
            const response = await followService.getAllFollowers(userId)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data)
        } catch (error) {
            return errorResponse(res, "an error occured contact support", 500)

        }

    }
}
export const followController = new FollowerController()