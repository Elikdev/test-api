import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Post } from "./post.model";

class PostService extends BaseService {
    public getAllPosts() {
        return this.internalResponse(true, {});
    }

    public async addNewPost(authuser: jwtCred, postDTO: {}) {
        const user_id = authuser.id;
        let user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: [],
        });

        return this.internalResponse(true, {}, 200, "success");
    }
}

export const postService = new PostService();
