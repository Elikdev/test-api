import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"

@Entity({ name: "activities_request" })
export class ActivitiesRequest {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    celeb_id: number

    @Column()
    payment_ref: string

    @Column()
    amount: string

    @Column()
    celeb_done: boolean

    @Column()
    user_done: boolean

    @Column({ type: "json" })
    meta: Record<string, unknown>

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
