import { ManyToOne, Entity, JoinColumn } from "typeorm";
import { BaseModel } from "../../helpers/db.helper";
import { User } from "../user/user.model";


@Entity({name:'follow'})
export class Follow extends BaseModel{

    @ManyToOne(() => User, user => user.followers)
    @JoinColumn({ "name": "followed_id" })
    followed: User
    
    @ManyToOne(() => User, (user) => user.following)
    @JoinColumn({ "name": "follower_id" })
    follower: User

}