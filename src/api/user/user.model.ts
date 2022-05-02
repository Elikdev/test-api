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
import { AccountStatus, AccountType, RoleType } from "../../utils/enum"

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

  @Column({ type: "timestamp", nullable: true })
  last_login: Date

  @Column({type: "enum", enum: AccountType, default: AccountType.FAN})
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

  @Column({ nullable: true})
  referred_by: number

  @Column({ type: "simple-json", nullable: true })
  email_verification: {
    otp_verified: boolean
    otp_code: string
    expires_in: string
  }
}
