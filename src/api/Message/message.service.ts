import { getRepository } from "typeorm"
import { BaseService, jwtCred, MessageType } from "../../enums"
import { User } from "../User/user.model"
import { Message } from "./message.model"
import {Chat} from  "../Chat/chat.model"

class MessageService extends BaseService {
    // public async getMessage(authuser: jwtCred) {
    //     const user_id = authuser.id
    //     return this.internalResponse(
    //         true,
    //         {
    //             /** replace with data */
    //         },
    //         200,
    //         "Message retrieved"
    //     )
    // }

    //get messages under a chat
    public async getAllMessages(authuser: jwtCred, messageDTO: {chatId: number}){
        const user_id = authuser.id

        const chat_exists = await getRepository(Message).find({
            where: {
                chat: messageDTO.chatId
            }
        })

        if(!chat_exists){
            return this.internalResponse(false, {}, 400, "Invalid chat Id")
        }

        if(chat_exists.length <= 0){
            return this.internalResponse(false, {}, 400, "No messages under this chat")
        }

        let chat_messages = []

        chat_messages = chat_exists.filter((message)=> {
            const deleted_by = message.deleted_by?.split("+")
            return !message.deleted || !deleted_by?.includes(user_id.toString())
        })

        return this.internalResponse(true, chat_messages, 200, "Messages retrieved")
    }

    public async newMessage(authuser: jwtCred, messageDTO: {
        chatId: number
        content: string
        type: MessageType
    }) {
        const user_id = authuser.id

        //check if chat exists
        const chat_exists = await getRepository(Chat).findOne({
            where: [
                {user_1: user_id, id: messageDTO.chatId},
                {user_2: user_id, id: messageDTO.chatId}
            ]
        })

        if(!chat_exists){
            return this.internalResponse(false, {}, 400, "Invalid chat Id")
        }

        const new_message = getRepository(Message).create({
            content: messageDTO.content,
            type: messageDTO.type,
            sender_id: user_id,
        })

        new_message.chat = chat_exists

        //save message
        const message = await this.save(Message, new_message)

        // if(message){
        //     chat_exists.messages.push(message)
        //     await this.save(Chat, chat_exists)
        // }

        return this.internalResponse(
            true,
            message,
            200,
            "New message created"
        )
    }

    public async deleteMessage(authuser: jwtCred, messageDTO: {messageId: number}){
        const user_id = authuser.id

        //get the message
        const message_exists = await getRepository(Message).findOne({
            where: {id: messageDTO.messageId}
        })

        if(!message_exists){
            return this.internalResponse(false, {}, 400, 'Invalid message Id')
        }

        let deleted_by

        const users_deleted_by = message_exists.deleted_by?.split("+")
        
        if(message_exists.deleted && users_deleted_by?.length < 2 && !users_deleted_by?.includes(user_id.toString())){
            deleted_by = `${users_deleted_by[0]}+${user_id.toString()}`
        }else{
            deleted_by = user_id.toString()
        }

        const delete_details = {
            deleted: true,
            deleted_by: deleted_by
        }

        this.schema(Message).merge(message_exists, delete_details)

        await this.updateOne(Message, message_exists)

        return this.internalResponse(true, {}, 200, "Message deleted successfully")

    }
}

export const messageService = new MessageService()
