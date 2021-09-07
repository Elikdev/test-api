import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Media } from "../Posts/media.model";
import { Like } from "../Likes/like.model";
import { Comment } from "../Comments/comment.model";
import { User } from "../User/user.model";

@Entity({ name: "post" })
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    // @Column()
    // user_id: number;

    @Index({ unique: true })
    @Column({ nullable: false, unique: true })
    short_url: string;

    // @Column({ default: 0 })
    // likes: number;

    @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @OneToMany(() => Media, (media) => media.post)
    media: Media[];

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

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
