import { BaseService, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Comment } from "./comment.model";

class CommentService extends BaseService {
    public async addNewComment(authuser: jwtCred, commentDTO: {}) {
        const user_id = authuser.id;
        let user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: [""],
        });

        return this.internalResponse(true, {}, 200, "success");
    }

    public editComment() {
        return this.internalResponse(true, {});
    }
}

export const commentService = new CommentService();
