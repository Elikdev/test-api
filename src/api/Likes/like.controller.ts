import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import {} from "./like.model";
import { likeService } from "./like.service";

class LikeController {
    getAllLikes(req: Request, res: Response) {
        const response = likeService.getAllLikes();
        return successRes(res, response.data);
    }

    async addLike(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const likeDTO = req.body;
            const response = await likeService.addLike(authuser, likeDTO);
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

    // async
}

export const likeController = new LikeController();
