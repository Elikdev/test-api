import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { Message } from '../messages/messages.model';
import { Requests } from '../requests/request.model';
import {User} from '../user/user.model'

@Entity('rooms')
export class Room extends BaseModel{

    @ManyToOne(()=>User, user=>user.influencer_rooms)
    @JoinColumn({"name":"influencer"})
    influencer:User

    @ManyToOne(()=>User,user=>user.fan_rooms)
    @JoinColumn({"name":"fan"})
    fan:User

    @Column()
    room_id:string

    @Column()
    room_blocked: boolean

    @OneToOne(() => Requests, reqs => reqs.room)
    request: Requests

    @OneToMany(()=>Message, message=>message.room)
    conversations:Message[]
}