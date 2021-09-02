import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Like } from "./like.model";

class LikeService extends BaseService {
    public getAllLikes() {
        return this.internalResponse(true, {});
    }

    public async addLike(authuser: jwtCred, likeDTO: {}) {
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

export const likeService = new LikeService();
