import {BaseService} from "../../helpers/db.helper"
import {jwtCred, IncomingMessage} from "../../utils/enum"
import {roomService} from "../room/room.service"
import { userService } from "../user/user.services"
import { Message } from "./messages.model"

class MessageService extends BaseService {
  super: any

  public async newInstanceOfMessage(message: IncomingMessage) {
    const new_message = new Message()

    const {
      id,
      sender,
      receiver,
      message: incoming_msg,
      room: incoming_room,
      room_id,
      time,
    } = message
    //find users
    const incoming_sender = await userService.findUserWithId(sender)
    if (!incoming_sender) {
      return null
    }
    const incoming_receiver = await userService.findUserWithId(receiver)
    if (!incoming_receiver) {
      return null
    }

    const room = await roomService.findRoomById(incoming_room)
    if (!room) {
      return null
    }

    if (incoming_sender && incoming_receiver && incoming_sender) {
      new_message.sender = incoming_sender
      new_message.receiver = incoming_receiver
      new_message.room_id = room_id
      new_message.message = incoming_msg
      new_message.message_id = id
      new_message.room = room
      new_message.time = time
      return new_message
    } else {
      return null
    }
  }

  public async saveMessage(messageInstance: Message | null) {
    return this.save(Message, messageInstance)
  }

  public async newSetOfMessages(msgDTO: IncomingMessage[]) {
    const new_messages = msgDTO

    ///for each messages --check if the room are the same
    //using filter
    const first_msg = new_messages[0]
    const notInTheSamRoom = new_messages.filter(
      (msg) =>
        first_msg.room_id.toString() !== msg.room_id.toString() &&
        first_msg.room !== msg.room
    )

    if (notInTheSamRoom.length >= 1) {
      return this.internalResponse(
        false,
        {},
        400,
        "incoming messages must be with the same room_id"
      )
    }

    //check if the room exists on the db
    for (const msg of new_messages) {
      const room_exists = await roomService.findRoomByIdAndRoomId(
        msg.room,
        msg.room_id,
        msg.sender,
        msg.receiver
      )

      if (!room_exists) {
        return this.internalResponse(
          false,
          { sender: msg.sender, receiver: msg.receiver },
          400,
          `${msg.room_id} does not exist for both sender and receiver`
        )
      } else {
        break
      }
    }

    //saving the messages
    const messages_saved = []
    for (const save_msg of new_messages) {
      const new_msg = await this.newInstanceOfMessage(save_msg)

      if (!new_msg) {
        return this.internalResponse(
          false,
          { msg: save_msg },
          400,
          `Failed to save message due to invalid sender/receiver id or invalid room`
        )
      } else {
        //save message
        const saved_message = await this.saveMessage(new_msg)

        if (!saved_message) {
          return this.internalResponse(
            false,
            { msg: save_msg },
            400,
            "Error in saving a message"
          )
        } else {
          const { receiver, sender, ...data } = saved_message
          const new_data = {
            ...data,
            receiver_id: receiver.id,
            sender_id: sender.id,
          }
          messages_saved.push(new_data)
        }
      }
    }

    //if everthing goes well
    return this.internalResponse(
      true,
      messages_saved,
      200,
      "All messages have been saved"
    )
  }
}

export const messageService = new MessageService()