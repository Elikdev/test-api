import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { AccountStatus, Gender, AccountType } from "../../enums";
import { Interest } from "../Interests/interest.model";
import { Payment_detail } from "../Payment/payment.model";
import { Transactions } from "../Transactions/transaction.model";
import { Wallet } from "../Wallet/wallet.model";
import { Like } from "../Likes/like.model";
import { Comment } from "../Comments/comment.model";
import { Post } from "../Posts/post.model";
import { Follow } from "../follow/follow.model";
@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: false })
    password: string;

    @Index({ unique: true })
    @Column({ nullable: false })
    username: string;

    @Column()
    profile_pic: string;

    @Column()
    phone: string;

    @Column()
    descriptions: string;

    @Column({ type: "enum", enum: AccountType })
    account_type: AccountType;

    @Column({
        default: AccountStatus.PENDING,
        type: "enum",
        enum: AccountStatus,
    })
    status: AccountStatus;

    @Column({
        nullable: false,
        type: "enum",
        enum: Gender,
        default: Gender.UNKNOWN,
    })
    sex: Gender;

    @Column({ type: "date" })
    date_of_birth: string;

    @Column({ nullable: true })
    profile_wallpaper: string;

    @Index({ unique: true })
    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ type: "timestamp" })
    last_seen: Date;

    @Column({ default: 0 })
    followers_count: number;

    @Column({ default: 0 })
    following_count: number;

    @Column({ default: 0 })
    posts_count: number;

    @Column({ nullable: true })
    location: string;

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

    @OneToOne(() => Interest)
    @JoinColumn()
    interest: Interest;

    @OneToOne(() => Payment_detail, (payment_detail) => payment_detail.user)
    payment_details: Payment_detail;

    @OneToOne(() => Wallet)
    wallet: Wallet;

    @OneToMany(() => Transactions, (t) => t.user)
    transactions: Transactions[];

    @OneToMany(() => Like, (like) => like.user)
    likes: Like[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Follow, follow => follow.followed)
    followers: Follow[];
    @OneToMany(() => Follow, follow => follow.follower)
    followed: Follow[];
}
