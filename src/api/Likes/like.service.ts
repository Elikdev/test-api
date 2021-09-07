import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Like } from "./like.model";
import {Post} from "../Posts/post.model"
import { getRepository } from "typeorm";

class LikeService extends BaseService {
    public async getAllLikes(authUser: jwtCred, likeDTO: {
        postId: string
    }) {
        const user_id =  authUser.id
        //get the user
        const user = await this.findOne(User, {
            where: {
                id: user_id
            },
            relations: ["likes"]
        })

        //for a particular post
        if(likeDTO.postId){
            const post = await this.findOne(Post, {
                where: {
                    id: parseInt(likeDTO.postId, 10)
                },
                relations: ["likes"]
            })
            
            if(!post){
                return this.internalResponse(false, {}, 400, "Post not found")
            }

            //get the likes for the post
            const likes = await this.schema(Like).find({
                where: {
                    post: post.id
                },
                order: {created_at: "ASC"},
                relations: ["post"]
            })

            if(likes.length <= 0){
                return this.internalResponse(false, {}, 400, "No likes")
            }

            const result = {
                likes,
                count: likes.length
            }

            return this.internalResponse(true,  result, 200, "Likes retrieved")

        } else {//for user
            
            const likes = await this.schema(Like).find({
                where: {
                    user: user_id
                },
                order: {created_at: "ASC"},
                relations: ["post"]
            })
            
            if(likes.length <= 0){
                return this.internalResponse(false, {}, 400, "No likes")
            }

            const result = {
                likes,
                count: likes.length
            }

            return this.internalResponse(true,  result, 200, "User's likes retrieved")
        }
    }

    public async likeAndUnlike(authuser: jwtCred, likeDTO: {
        postId: number
    }) {
        const user_id = authuser.id;
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["likes"],
        });

        //search for the post
        const post = await this.findOne(Post, {
            where: {
                id: likeDTO.postId
            }
        })

        if(!post){
            return this.internalResponse(false, {}, 400, "Post not found")
        }


        //check if user has liked the post before, 
        const post_liked = await this.findOne(Like, {
            where: {
                user: user_id,
                post: post.id
            }
        })

        if(post_liked){ //remove like if user has liked the post (unlike)
            const unlike = await this.schema(Like).remove(post_liked)

            if(!unlike){
                return this.internalResponse(false, {}, 400, "An error occurred")
            }

            return this.internalResponse(true, {}, 200, "Post unliked!")
            
        } else {

        //if user has not liked the post before, create a new like (like)
        const new_like = await getRepository(Like).create()

        new_like.post = post
        new_like.user = user

        const result = await this.save(Like, new_like)

        if(!result){
            return this.internalResponse(false, {}, 400, "An error occurred")
        }

        delete result.user
        //response message
        return this.internalResponse(true, {}, 200, "Post liked!");
        }
    }
}

export const likeService = new LikeService();
