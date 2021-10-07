import { ChildEntity, Column, JoinColumn, OneToOne} from "typeorm";
import {User} from '../user/user.model'



@ChildEntity()
export class Influencer extends User {

    @Column("simple-array")
    industry:string[]

    @Column()
    social_media_link:string

    @Column()
    live_video:string

    // @OneToOne(()=>Wallet, wallet=>wallet.influencer)
    // @JoinColumn()
    // wallet:Wallet

}