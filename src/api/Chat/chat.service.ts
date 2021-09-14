import { getRepository } from "typeorm"
import { BaseService, jwtCred } from "../../enums"
import { User } from "../User/user.model"
import { Chat } from "./chat.model"

class ChatService extends BaseService {
    public async getChat(authuser: jwtCred) {
        const user_id = authuser.id
        return this.internalResponse(
            true,
            {
                /** replace with data */
            },
            200,
            "Chat retrieved"
        )
    }

    public async newChat(authuser: jwtCred, chatDTO: "") {
        const user_id = authuser.id

        return this.internalResponse(
            true,
            {
                /** replace with data */
            },
            200,
            "New chat created"
        )
    }
}

export const chatService = new ChatService()
