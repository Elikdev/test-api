import { BaseService } from "../../helpers/db.helper"
import { Room } from "./room.model"
import { User } from "../user/user.model"
import { Influencer } from "../influencer/influencer.model"

class RoomService extends BaseService {
  super: any

  public async findRoomByIdAndRoomId(
    id: number,
    room_id: any,
    user_1: number,
    user_2: number
  ) {
    const queryOptions = {
      id,
      room_id,
    }
    return await this.findOne(Room, {
      where: [
        { fan: user_1, influencer: user_2, ...queryOptions },
        { fan: user_2, influencer: user_1, ...queryOptions },
      ],
    })
  }

  public async findRoomById(id: number) {
    return await this.findOne(Room, {
      where: { id },
    })
  }

  public async findRoomByRoomId(room_id: any, user_id: number) {
    const queryOptions = {
      room_id,
    }

    return await this.findOne(Room, {
      where: [
        { fan: user_id, ...queryOptions },
        { influencer: user_id, ...queryOptions },
      ],
    })
  }

  public async roomInstance(
    room_id: string,
    user: User,
    influencer: Influencer
  ): Promise<Room> {
    const new_room = new Room()

    new_room.room_id = room_id
    new_room.fan = user
    new_room.influencer = influencer

    return new_room
  }

  public async saveRoom(room: Room): Promise<Room> {
    return await this.save(Room, room)
  }

  public async createRoom(fan: User, influencer: Influencer) {
    const randDate = new Date().getTime()
    const roomId = "room" + randDate + Math.random().toString(36).slice(2, 9);

    const new_room = await this.roomInstance(
      roomId,
      fan,
      influencer
    )
    return await this.saveRoom(new_room)
  }

}

export const roomService = new RoomService()
