import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Comment } from "./comment.model";
import {Post} from "../Posts/post.model"

class CommentService extends BaseService {
    public async addNewComment(authuser: jwtCred, commentDTO: {
        content: string,
        postId: number
    }) {
        const user_id = authuser.id;
        
        //get the user
        let user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["comments"],
        });

        if(!user){
            return this.internalResponse(false, {}, 404, "User not found")
        }

        //get the post
        const post_exists = await this.findOne(Post, {
            where: {
                id: commentDTO.postId
            }
        })

        if(!post_exists){
            return this.internalResponse(false, {}, 404, "Post not found")
        }

        
        //update the post

        //response message

        return this.internalResponse(true, {}, 200, "success");
    }

    public editComment() {
        return this.internalResponse(true, {});
    }
}

export const commentService = new CommentService();
