import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm"
import { Chat } from "../Chat/chat.model"

@Entity({ name: "message" })
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @Column()
    type: string

    @Column()
    sender_id: number

    @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: "CASCADE" })
    @JoinColumn()
    chat: Chat

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
