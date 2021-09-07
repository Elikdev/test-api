import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "../Posts/post.model";
import { User } from "../User/user.model";

@Entity({ name: "like" })
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
    @JoinColumn()
    post: Post;

    @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
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
