import { getRepository } from "typeorm"
import { BaseService, jwtCred } from "../../enums"
import { Message } from "../Message/message.model"
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

        delete chat_exist.messages
        delete chat_exist.archived
        delete chat_exist.archived_by
        
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
            relations: ["messages"],
            order: {created_at: "DESC"}
        })

        if(chats.length <= 0){
            return this.internalResponse(false, {}, 400, "No chats found")
        }

        let user_chats = []

        user_chats = chats.filter((chat) => {
            const archived_by = chat.archived_by?.split("+")
            return !chat.archived || !archived_by?.includes(user_id.toString())
        })

        if (user_chats.length <= 0) {
            return this.internalResponse(false, {}, 400, "No chats found")
        }

        for (const chat of user_chats) {
            delete chat.messages
            delete chat.archived
            delete chat.archived_by
        }
        
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
        if (chat_exist) {
            const users_archived_by = chat_exist.archived_by?.split("+")
            let archived_by
            let filter_users
            //remove the user from archived_by
            if(users_archived_by?.length === 0){
                archived_by = null
            }else if(users_archived_by?.length === 2 && users_archived_by?.includes(user_id.toString())){
                filter_users = users_archived_by?.filter((id)=> {
                    return parseInt(id) !== user_id
                })
                archived_by = filter_users[0].toString()
            }else if(users_archived_by?.length === 1 && users_archived_by?.includes(user_id.toString())){
                archived_by = null
            }
            
            //update the chat
            const update_details = {
                archived_by: archived_by
            }
            this.schema(Chat).merge(chat_exist, update_details)

            const newChat = await this.updateOne(Chat, chat_exist)

            //remove messages
            const {messages,archived, archived_by:res_archived_by, ...data} = newChat

            return this.internalResponse(true, data, 200, "New chat started")
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

        const user = await getRepository(User).findOne({
            where: {id: user_id}
        })

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

        const users_blocked_by = chat_exist.blocked_by?.split("+")
        let blocked_at
        let blocked_by
        let filter_users
        let blocked = chatDTO?.blocked

        if(chatDTO.open && user.account_type !== "celebrity") {
            return this.internalResponse(false, {}, 400, "You do not have access to open this chat")
        }

        //update chat
        if (chatDTO.blocked == false) {
            blocked_at = null

            if (!chat_exist.blocked) {
                return this.internalResponse(
                    true,
                    {},
                    400,
                    "Chat was not initially blocked"
                )
            } else if (users_blocked_by?.length === 0) {
                blocked_by = null
            } else if (
                users_blocked_by?.length === 2 &&
                users_blocked_by?.includes(user_id.toString())
            ) {
                filter_users = users_blocked_by?.filter((id) => {
                    return parseInt(id) !== user_id
                })
                blocked_by = filter_users[0].toString()
                blocked = true
            } else if (
                users_blocked_by?.length === 1 &&
                users_blocked_by?.includes(user_id.toString())
            ) {
                blocked_by = null
            } else if (
                users_blocked_by?.length === 1 &&
                !users_blocked_by?.includes(user_id.toString())
            ) {
                return this.internalResponse(
                    true,
                    {},
                    400,
                    "Unauthorized to unblock"
                )
            } else {
                blocked_by = null
            }
        }

        if(chatDTO.blocked == true){
            if (chat_exist.blocked == true && users_blocked_by?.includes(user_id.toString())) {
                return this.internalResponse(
                    false,
                    {},
                    400,
                    "Chat has been initially blocked"
                )
            }else if (users_blocked_by?.length < 2 && !users_blocked_by?.includes(user_id.toString())) {
                blocked_at = new Date()
                blocked_by = `${users_blocked_by[0]}+${user_id.toString()}`
            } else {
                blocked_at = new Date()
                blocked_by = user_id.toString()
            }

        }


        //update details
        const update_details = {
            blocked: blocked,
            blocked_at: blocked_at,
            blocked_by: blocked_by,
            open: chatDTO?.open,
        }

        this.schema(Chat).merge(chat_exist, update_details)

        const chat = await this.updateOne(Chat, chat_exist)

        delete chat.messages
        delete chat.archived
        delete chat.archived_by

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

        if(chat_exist.archived && users_archived_by?.length < 2 && !users_archived_by?.includes(user_id.toString())){
            archived_by = `${users_archived_by[0]}+${user_id.toString()}`
        }else{
            archived_by = user_id.toString()
        }


        //archive the messages too
        const messages = await getRepository(Message).find({
            where: {chat: chatDTO.chatId}
        })

       const filter_messages = messages.filter((msg) => {
           const users_deleted_by = msg.deleted_by?.split("+")
           return (
               !msg.deleted ||
               (msg.deleted && !users_deleted_by?.includes(user_id.toString()))
           )
       })

        for (const msg of filter_messages) {
            const message = await getRepository(Message).findOne({
                where: {id: msg.id}
            })
            const users_deleted_by = message.deleted_by?.split("+")
            let msg_deleted_by
            let deleted

            if(message.deleted_by && users_deleted_by?.length < 2 && !users_deleted_by?.includes(user_id.toString())) {
                deleted = true
                msg_deleted_by = `${users_deleted_by[0]}+${user_id.toString()}}`
            }else{
                deleted = true
                msg_deleted_by = user_id.toString()
            }
            
            const delete_msg = {
                deleted: deleted,
                deleted_by: msg_deleted_by
            }

            this.schema(Message).merge(message, delete_msg)

            this.updateOne(Message, message)
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
