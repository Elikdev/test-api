import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { User } from "../User/user.model";
@Entity({ name: "followers" })
export class Follow {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.followers)
    @JoinColumn({ "name": "followed_id" })
    followed: User
    @ManyToOne(() => User, user => user.followed, { eager: true })
    @JoinColumn({ "name": "follower_id" })
    follower: User
    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date;


}
