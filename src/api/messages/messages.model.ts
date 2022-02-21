import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { Room } from '../room/room.model';
import {User} from '../user/user.model'

@Entity('messages')
export class Message extends BaseModel{

    @ManyToOne(()=>User, user=>user.sent)
    @JoinColumn({"name":"sender"})
    sender:User

    @ManyToOne(()=>User,user=>user.received)
    @JoinColumn({"name":"receiver"})
    receiver:User

    @Column()
    message:string

    @Column()
    message_id: number

    @Column()
    room_id:string

    @Column()
    unique_msg_id: string

    @Column()
    time: Date

    @ManyToOne(()=>Room, room=>room.conversations)
    @JoinColumn({'name':"room"})
    room:Room
}