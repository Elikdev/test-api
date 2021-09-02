import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Post } from "./post.model";
import { postService } from "./post.service";

class PostController {
    getAllPosts(req: Request, res: Response) {
        const response = postService.getAllPosts();
        return successRes(res, response.data);
    }

    async addNewPost(req: Request, res: Response) {
        try {
            const authuser = (req as any).user;
            const postDTO = req.body;
            const response = await postService.addNewPost(authuser, postDTO);
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

export const postController = new PostController();
