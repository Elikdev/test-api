import { BaseService } from "../../helpers/db.helper"
import { Room } from "./room.model"
import { User } from "../user/user.model"
import { Influencer } from "../influencer/influencer.model"
import { Admin } from "../admin/admin.model"
import { adminService } from "../admin/admin.services"
import { getRepository, ILike } from "typeorm"
import { Permissions } from "../../utils/enum"
import { userService } from "../user/user.services"

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
      relations: ["conversations"]
    })
  }

  public async findRoomById(id: number) {
    return await this.findOne(Room, {
      where: { id },
      relations: ["conversations"]
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
      relations: ["conversations", "fan", "influencer"]
    })
  }

  public async getRoombyRoomIdOnly(room_id: any) {
    return await this.findOne(Room, {
      where: {room_id: room_id},
      relations: ["conversations"]
    })
  }

  public async roomInstance(
    room_id: string,
    user: User,
    influencer: Influencer | Admin
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
    const room_id = "room" + randDate + Math.random().toString(36).slice(2, 9);

    const new_room = await this.roomInstance(
      room_id,
      fan,
      influencer
    )
    return await this.saveRoom(new_room)
  }

  public async createRoomForHelpAndSupport(userId: number) {
    const room_id = `room-admin-${userId}`;

    let roles = []
    //find one admin -- since the admin can chat with all users
    const admins = await getRepository(Admin).find({
      where: {is_verified: true}
    })

    if(admins.length <= 0 ) {
      return this.internalResponse(false, {}, 400, "No admin to respond to help and support")
    }

    let admin_set = []

    //check if admin is available for help and support
    for (const admin of admins) {
      if(admin.permissions.length > 0) {
        //check if admin is available for help and support
        if(admin.permissions.includes(Permissions.CHAT_SUPPORT)) {
          admin_set.push(admin)
          break
        }
      }
    }

    if(admin_set.length < 0) {
      return this.internalResponse(false, {}, 400, "No available admin to respond to help and support")
    }
    
    const user = await userService.findUserWithId(userId)

    if(!user) {
      return this.internalResponse(false, {}, 400, "User does not exist")
    }
    //check if room has been created initally
    const room_exists = await this.findRoomByRoomId(room_id, userId)

    if(room_exists) {
      delete room_exists.fan.password
      delete room_exists.fan.email_verification
      delete room_exists.influencer.password
      delete room_exists.influencer.email_verification
      return this.internalResponse(true, room_exists, 200, "Room created and retrieved!")
    }

    const new_room = await this.roomInstance(
      room_id,
      user,
      admin_set[0]
    )
    const saved_room = await this.saveRoom(new_room)

    if(!saved_room) {
      return this.internalResponse(false, {}, 400, "Error in creating room")
    }

    delete saved_room.fan.password
    delete saved_room.fan.email_verification
    delete saved_room.influencer.password
    delete saved_room.influencer.email_verification

    return this.internalResponse(true, saved_room, 200, "Room created and retrieved!")
  }

  public async getRoomAdminExistsIn() {
    const rooms = await getRepository(Room).find({
      where: {room_id: ILike("%room-admin%")},
      relations: ['conversations', 'fan', 'influencer']
    })

    if(rooms.length <= 0) {
      return this.internalResponse(false, {}, 400, "No room esists for admin")
    }

    for (const room of rooms) {
      delete room.fan.password
      delete room.fan.email_verification
      delete room.influencer.password
      delete room.influencer.email_verification
    }

    return this.internalResponse(true, rooms, 200, "Rooms for admin retrieved!")
  }
}

export const roomService = new RoomService()
