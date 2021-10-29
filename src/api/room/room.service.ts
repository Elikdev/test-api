import { BaseService } from "../../helpers/db.helper"
import { Room } from "./room.model"

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
}

export const roomService = new RoomService()
