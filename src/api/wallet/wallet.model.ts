import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import { Influencer } from "../influencer/influencer.model"
import { User } from "../user/user.model"

@Entity({ name: "wallet" })
export class Wallet extends BaseModel {
  @Column()
  wallet_balance: string

  @Column()
  ledger_balance: string

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User
}
