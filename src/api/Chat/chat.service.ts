import { getRepository } from "typeorm"
import { BaseService, jwtCred } from "../../enums"
import { User } from "../User/user.model"
import { Chat } from "./chat.model"

class ChatService extends BaseService {
    public async getChat(authuser: jwtCred, chatDTO: {chatId: number}) {
        const user_id = authuser.id

        //get the chat --user owns/is in this chat
        const chat_exist = await getRepository(Chat).findOne({
            where: [
                {user_1: user_id, id: chatDTO.chatId},
                {user_2: user_id, id: chatDTO.chatId}
            ],
            relations: ["messages"]
        })

        if(!chat_exist){ 
            return this.internalResponse(false, {}, 400, "Invalid chat Id")
        }

        const archived_by = chat_exist.archived_by?.split("+")

        if(chat_exist.archived && archived_by.includes(user_id.toString())){
            return this.internalResponse(false, {}, 400, "Chat not found")
        }
        return this.internalResponse(
            true,
            chat_exist,
            200,
            "Chat retrieved"
        )
    }

    public async getChats(authUser: jwtCred){
        const user_id = authUser.id

        //get the users chats
        const chats = await getRepository(Chat).find({
            where: [ 
                {user_1: user_id},
                {user_2: user_id}
            ],
            relations: ["messages"]
        })

        if(chats.length <= 0){
            return this.internalResponse(false, {}, 400, "No chats found")
        }

        let user_chats = []

        user_chats = chats.filter((chat) => {
            const archived_by = chat.archived_by?.split("+")
            return !chat.archived || !archived_by?.includes(user_id.toString())
        })

        return this.internalResponse(true, user_chats, 200, "Chats retrieved")
    }

    public async newChat(authuser: jwtCred, chatDTO: {
        user_2: number
    }) {
        const user_id = authuser.id
        const user_name = authuser.username


        if(user_id === chatDTO.user_2){
            return this.internalResponse(false, {}, 400, "Invalid user ID")
        }

        //user_1 -- started the conversation/chat (current logged in user)
        //user_2 -- user_1 wants to chat with
        const user_2 = await getRepository(User).findOne({
            where: {
                id: chatDTO.user_2
            }
        })

        if(!user_2){
            return this.internalResponse(false, {}, 400, "User account not found")
        }

        //check if the user and the other user have been chatting before
        const chat_exist = await getRepository(Chat).findOne({
            where: [
                {user_1: user_id, user_2: user_2.id},
                {user_1: user_2.id, user_2: user_id}
            ],
            relations: ["messages"]
        })
        
        //return chat if it exists
        if(chat_exist){
            return this.internalResponse(true, chat_exist, 200, "Chat existed")
        }

        //slug -- username_1-username_2
        const slug = `${user_name}-${user_2.username}`

        //start a new chat
        const new_chat = await getRepository(Chat).create({
            slug: slug,
            user_1: user_id,
            user_2: chatDTO.user_2
        })

        const chat = await this.save(Chat, new_chat)

        if(!chat){
            return this.internalResponse(false, {}, 400, "Error in starting a new chat. Try again later")
        }

        return this.internalResponse(
            true,
            chat,
            200,
            "New chat started"
        )
    }

    public async updateChat(authUser: jwtCred, chatDTO: {
        blocked: boolean
        open: boolean
        chatId: number
    }) {
        const user_id = authUser.id
        //get the chat --user owns/is in this chat
        const chat_exist = await getRepository(Chat).findOne({
            where: [
                {user_1: user_id, id: chatDTO.chatId},
                {user_2: user_id, id: chatDTO.chatId}
            ],
            relations: ["messages"]
        })

        if(!chat_exist){
            return this.internalResponse(false, {}, 400, "Invalid chat Id")
        }

        let blocked_at
        //update chat
        if(chatDTO.blocked !== undefined){
            blocked_at = new Date()
        }

        //update details
        const update_details =  {
            blocked: chatDTO?.blocked,
            blocked_at: blocked_at,
            open: chatDTO?.open
        }

        this.schema(Chat).merge(chat_exist, update_details)

        const chat = await this.updateOne(Chat, chat_exist)

        return this.internalResponse(true, chat, 200, "Chat updated successfully")
    }

    public async deleteChat(authUser: jwtCred, chatDTO: {chatId: number}){
        const user_id = authUser.id

        //get the chat --user owns/is in this chat
        const chat_exist = await getRepository(Chat).findOne({
            where: [
                {user_1: user_id, id: chatDTO.chatId},
                {user_2: user_id, id: chatDTO.chatId}
            ],
            relations: ["messages"]
        })

        if(!chat_exist){
            return this.internalResponse(false, {}, 400, "Invalid chat Id")
        }

        //archived_by = user_1+user_2

        let archived_by

        const users_archived_by = chat_exist.archived_by?.split("+")

        if(chat_exist.archived && users_archived_by?.length === 2){
            return this.internalResponse(false, {}, 400, "Chat not found")
        }

        if(chat_exist.archived && users_archived_by.length < 2 && !users_archived_by?.includes(user_id.toString())){
            archived_by = `${chat_exist.archived_by.split("+")[0]}+${user_id.toString()}`
        }else{
            archived_by = `${user_id.toString()}`
        }

        const delete_details = {
            archived: true,
            archived_by: archived_by
        }

        this.schema(Chat).merge(chat_exist, delete_details)

        await this.updateOne(Chat, chat_exist)

        return this.internalResponse(true, {}, 200, "Chat deleted successfully")
    }
}

export const chatService = new ChatService()
