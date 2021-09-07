import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "../Posts/post.model";
import { User } from "../User/user.model";

@Entity({ name: "comment" })
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
    @JoinColumn()
    post: Post;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    updated_at: Date;
}
