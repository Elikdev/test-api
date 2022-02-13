import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import { campaignStatus, campaignType } from "../../utils/enum"
import { User } from "../user/user.model"

@Entity({ name: "campaign" })
export class Campaign extends BaseModel {
 @Column()
 sender: string

 @Column()
 campaign_name: string

 @Column({
  type: "enum",
  enum: campaignType
 })
 type: campaignType

 @Column()
 text: string

 @Column({
  type: "enum",
  enum: campaignStatus
 })
 status: campaignStatus

 @ManyToOne(() => User, user => user.campaigns)
 @JoinColumn()
 user: User
}