import { getRepository } from "typeorm"
import { BaseService, jwtCred } from "../../enums"
import { User } from "../User/user.model"
import { Message } from "./message.model"

class MessageService extends BaseService {
    public async getMessage(authuser: jwtCred) {
        const user_id = authuser.id
        return this.internalResponse(
            true,
            {
                /** replace with data */
            },
            200,
            "Message retrieved"
        )
    }

    public async newMessage(authuser: jwtCred, messageDTO: "") {
        const user_id = authuser.id

        return this.internalResponse(
            true,
            {
                /** replace with data */
            },
            200,
            "New message created"
        )
    }
}

export const messageService = new MessageService()
