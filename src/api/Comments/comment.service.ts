import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Comment } from "./comment.model";
import {Post} from "../Posts/post.model"
import { getRepository } from "typeorm";

class CommentService extends BaseService {
    public async addNewComment(authuser: jwtCred, commentDTO: {
        content: string,
        postId: number
    }) {
        const user_id = authuser.id;

        //get the user
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["comments"],
        });

        //get the post
        const post_exists = await this.findOne(Post, {
            where: {
                id: commentDTO.postId,
            },
        });

        if (!post_exists) {
            return this.internalResponse(false, {}, 404, "Post not found");
        }

        //create a new comment
        const new_comment = await getRepository(Comment).create({
            content: commentDTO.content,
        });

        //update the foreign keys
        new_comment.post = post_exists;
        new_comment.user = user;

        //save the comment
        const result = await this.save(Comment, new_comment);
        delete result.user

        //response message
        return this.internalResponse(true, result, 200, "Comment added successfully");
    }

    public async editComment(authuser: jwtCred, commentDTO: {
        content: string,
        postId: number,
        commentId: number
    }) {
    const user_id = authuser.id
    
    //get the post
    const post_exists = await this.findOne(Post, {
        where: {
            id: commentDTO.postId
        },
    });

    if (!post_exists) {
        return this.internalResponse(false, {}, 400, "Post not found");
    }

    //get the comment
    const comment_exists = await this.findOne(Comment, {
        where: {
            id: commentDTO.commentId,
            user: user_id
        },
        relations: ["post"]
    });

    if (!comment_exists) {
        return this.internalResponse(false, {}, 400, "Comment not found");
    }

    //edit only the content
    const new_content = {
        content: commentDTO.content
    }

    const edited_comment = await this.schema(Comment).merge(comment_exists, new_content)

    //response message
    return this.internalResponse(true, edited_comment, 200, "Comment edited successfully");
    }
}

export const commentService = new CommentService();
