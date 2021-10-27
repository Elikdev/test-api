import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { Message } from '../messages/messages.model';
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
    unique_string:string

    @OneToMany(()=>Message, message=>message.room)
    conversations:Message[]
}