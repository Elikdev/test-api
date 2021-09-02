import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Comment } from "./comment.model";
import { commentService } from "./comment.service";

class CommentController {
    async addNewComment(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const commentDTO = req.body;
            const response = commentService.addNewComment(authuser, commentDTO);
            return successRes(res, response);
        } catch (error) {
            console.log(error);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    async editComment(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const commentDTO = req.body.interests;
            const response = await commentService.editComment();
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

export const commentController = new CommentController();
