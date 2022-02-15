import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import { Influencer } from "../influencer/influencer.model"

@Entity({ name: "bank" })
export class Bank extends BaseModel {
  @Column()
  account_name: string

  @Column()
  account_number: string

  @Column()
  bank_name: string

  @Column()
  bank_code: string

  @ManyToOne(() => Influencer, (influencer) => influencer.banks, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: Influencer
}
