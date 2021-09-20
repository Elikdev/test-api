import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import {} from "./like.model";
import { likeService } from "./like.service";

class LikeController {
    async getAllLikes(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const likeDTO = req.body
            const updatedDTO  =  {...likeDTO, postId: req.query.postId }
            const response = await likeService.getAllLikes(authuser, likeDTO);
            if (!response.status) {
                return errorResponse(
                    res,
                    response.message,
                    response.statusCode
                );
            }
            return successRes(res, response.data);
        } catch (e) {
            console.log(e);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    async likeAndUnlike(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const likeDTO = req.params.postId;
            const response = await likeService.likeAndUnlike(authuser, {postId: +likeDTO} )
            if (!response.status) {
                return errorResponse(
                    res,
                    response.message,
                    response.statusCode
                );
            }
            return successRes(res, response.data, response.message);
        } catch (e) {
            console.log(e);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    // async
}

export const likeController = new LikeController();
