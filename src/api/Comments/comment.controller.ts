import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Comment } from "./comment.model";
import { commentService } from "./comment.service";

class CommentController {
    async addNewComment(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const commentbody = req.body;
            const commentDTO = { ...commentbody, postId: req.params.postId };
            const response = await commentService.addNewComment(
                authuser,
                commentDTO
            )
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (error) {
            console.log(error);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    async editComment(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const commentbody = req.body;
            const postParams = req.params.postId;
            const commentParams = req.params.commentId;
            const commentDTO = {
                ...commentbody,
                postId: postParams,
                commentId: commentParams,
            };
            const response = await commentService.editComment(
                authuser,
                commentDTO
            )
            if (!response.status) {
                return errorResponse(
                    res,
                    response.message,
                    response.statusCode
                );
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    // async
}

export const commentController = new CommentController();
