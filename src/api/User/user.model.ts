
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, JoinColumn, OneToOne } from "typeorm";
import { AccountStatus, Gender, AccountType } from "../../enums"
import { Interest } from "../Interests/interest.model";
import { Wallet } from "../wallet/wallet.model";
@Entity({ name: 'user' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: false })
    password: string

    @Index({ unique: true })
    @Column({ nullable: false })
    username: string

    @Column()
    profile_pic: string


    @Column()
    phone: string

    @Column()
    descriptions: string

    @Column({ type: "enum", enum: AccountType })
    account_type: AccountType

    @Column({ default: AccountStatus.PENDING, type: "enum", enum: AccountStatus })
    status: AccountStatus

    @Column({ nullable: false, type: "enum", enum: Gender, default: Gender.UNKNOWN })
    sex: Gender

    @Column({ type: "date" })
    date_of_birth: string

    @Column({ nullable: true })
    profile_wallpaper: string

    @Index({ unique: true })
    @Column({ unique: true, nullable: false })
    email: string

    @Column({ type: 'timestamp' })
    last_seen: Date

    @Column({ default: 0 })
    followers_count: number

    @Column({ default: 0 })
    following_count: number

    @Column({ default: 0 })
    posts_count: number

    @Column({ nullable: true })
    location: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @OneToOne(() => Interest)
    @JoinColumn()
    interest: Interest;

    @OneToOne(() => Wallet)
    wallet: Wallet

}