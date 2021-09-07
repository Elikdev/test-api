import { getRepository } from "typeorm";
import { BaseService, jwtCred, MediaType, MediaData} from "../../enums";
import { User } from "../User/user.model";
import { Post } from "./post.model";
import {Media} from "./media.model";
import { String } from "aws-sdk/clients/batch";

class PostService extends BaseService {
    public async getPostViaUrl(postDTO: {
        shortUrl: string
    }) {
        const post = await this.schema(Post).findOne({
            where: {
                short_url: postDTO.shortUrl
            }, 
            relations: ["media", "likes"]
        })

        if(!post){
            return this.internalResponse(false, {}, 400, "No post found")
        }

        return this.internalResponse(true, post, 200, "Post retrieved");
    }


    public async getPostsByUser(authuser: jwtCred) {
        const user_id = authuser.id

        const posts = await this.schema(Post).find({
            where: {
                user: user_id
            }, 
            relations: ["media"]
        })

        if(posts.length < 0){
            return this.internalResponse(false, {}, 400, "No posts found")
        }

        return this.internalResponse(true, posts, 200, "Posts retrieved");
    }

    public async addNewPost(authuser: jwtCred, postDTO: {
        title: string,
        content: string,
        media: MediaData[]
    }) {
        const user_id = authuser.id;
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["posts"],
        });


        const short_url = Math.random().toString(36).substr(2, 8);

        const new_post = await getRepository(Post).create({
            title: postDTO.title,
            content: postDTO.content,
            short_url: short_url,
        })

        new_post.user = user
        const result = await this.save(Post, new_post)
        delete result.user

        let new_media
        //add new post based on the array 
        if(postDTO.media.length === 1) {
            new_media = getRepository(Media).create({
                url: postDTO.media[0].url,
                type: postDTO.media[0].type,
                user_id: user_id
            })
            new_media.post = new_post
            await this.save(Media, new_media)
        } 

        if(postDTO.media.length > 1) {
            const media_data = []
           postDTO.media.forEach(async (m) => {
                // media_data.push({...m, user_id: user_id})
               new_media =  await getRepository(Media).create({
                    url: m.url,
                    type: m.type,
                    user_id: user_id
                })
               
                new_media.post = new_post

                await this.save(Media, new_media)
                // media_data.push({id: result_new_media.id, url: result_new_media.url, type: result_new_media.type})
            })
        }
        
        return this.internalResponse(true, {...result, media: postDTO.media }, 200, "success");
    }

    public async deletePost(authuser: jwtCred, postDTO: {
        postId: number
    }){
        const user_id = authuser.id

        const post = await this.findOne(Post, {
            where: {
                id: postDTO.postId,
                user: user_id
            }
        })

        if(!post){
            return this.internalResponse(false, {}, 400, "Post not found or already deleted")
        }

        const deleted_post = await this.schema(Post).remove(post)

        if(!deleted_post){
            return this.internalResponse(false, {}, 400, "an error occurred")
        }

        return this.internalResponse(true, {}, 200, "Post deleted successfully")
    }
}

export const postService = new PostService();
