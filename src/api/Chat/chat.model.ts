import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { Message } from "../Message/message.model"

@Entity({ name: "chat" })
export class Chat {
    @PrimaryGeneratedColumn()
    id: number

    @Index({ unique: true })
    @Column({ nullable: false })
    slug: string

    @Column()
    user_1: number //user_id 1

    @Column()
    user_2: number //user_id 2

    @Column()
    blocked: boolean

    @Column()
    blocked_at: Date

    @Column()
    open: boolean

    @Column()
    archived: boolean

    @Column()
    archived_by: string

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[]

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
