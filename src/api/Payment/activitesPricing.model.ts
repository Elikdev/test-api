import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { User } from "../User/user.model"

@Entity({ name: "activities_pricing" })
export class ActivitiesPricing {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    message: number

    @Column()
    picture: number

    @Column()
    video: number

    @OneToOne(() => User, (user) => user.activitiesPricing)
    @JoinColumn()
    user: User

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    updated_at: Date
}
