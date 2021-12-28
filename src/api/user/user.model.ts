import {
  Column,
  Entity,
  OneToMany,
  TableInheritance,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import { Transactions } from "../transactions/transaction.model"
import { Requests } from "../requests/request.model"
import { Follow } from "../follow/follow.model"
import { Wallet } from "../wallet/wallet.model"
import { Industry } from "../industry/industry.model"
import { AccountStatus, RoleType } from "../../utils/enum"
import { Room } from "../room/room.model"
import { Message } from "../messages/messages.model"
import { RefreshToken } from "../auth/refreshToken.model"

@Entity({ name: "users" })
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class User extends BaseModel {
  @Column()
  full_name: string

  @Column({ unique: true })
  handle: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ unique: true })
  phone_number: string

  @Column()
  country_code: number

  @Column({ default: false })
  is_verified: boolean

  @Column({
    default: AccountStatus.ACTIVE,
    type: "enum",
    enum: AccountStatus,
  })
  status: AccountStatus // so that admin can disable or reactivate an account and prevent from logging

  @Column({ type: "timestamp" })
  last_login: Date

  @Column()
  account_type: string

  @Column({
    default: RoleType.BAMIKI_USER,
    type: "enum",
    enum: RoleType,
  })
  role: string

  @Column({ nullable: true })
  profile_image: string

  @Column({ nullable: true })
  bio: string

  @Column()
  referred_by: number

  @Column({ type: "simple-json" })
  email_verification: {
    otp_verified: boolean
    otp_code: string
    expires_in: string
  }

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet

  @OneToMany(() => Transactions, (transaction) => transaction.user)
  transactions: Transactions[]

  @ManyToMany(() => Requests, (requests) => requests.users)
  @JoinTable()
  requests: Requests[]

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow[]

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[]

  @OneToMany(() => Requests, (requests) => requests.influencer)
  influencer_requests: Requests[]

  @OneToMany(() => Requests, (requests) => requests.fan)
  fan_requests: Requests[]

  @OneToMany(() => Room, (room) => room.influencer)
  influencer_rooms: Room[]

  @OneToMany(() => Room, (room) => room.fan)
  fan_rooms: Room[]

  @OneToOne(() => Industry, (industry) => industry.industries)
  @JoinColumn()
  industry: Industry

  @OneToMany(() => Message, (message) => message.sender)
  sent: Message[]

  @OneToMany(() => Message, (message) => message.receiver)
  received: Message[]

  @OneToOne(() => RefreshToken, (rfreshT) => rfreshT.user)
  refresh_token: RefreshToken
}
