import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Post } from "./post.model";
import { postService } from "./post.service";

class PostController {
    async getPostViaUrl(req: Request, res: Response) {
        try {
            const postDTO = req.params.shortUrl
            const response = await postService.getPostViaUrl({shortUrl: postDTO})
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }

    }

    async getPostsByUser(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const response = await postService.getPostsByUser(authuser)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }

    }

    async addNewPost(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const postDTO = req.body
            const response = await postService.addNewPost(authuser, postDTO)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }

    async deletePost(req: Request, res: Response) {
        try {
            const authuser = (req as any).user
            const postDTO = req.params.postId
            const response = await postService.deletePost(authuser, {
                postId: +postDTO,
            })
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode)
            }
            return successRes(res, response.data, response.message)
        } catch (e) {
            console.log(e)
            return errorResponse(res, "an error occured contact support", 500)
        }
    }
}

export const postController = new PostController();
