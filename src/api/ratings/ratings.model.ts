import { Column, Entity, ManyToOne, JoinColumn, } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import { User } from  "../user/user.model"
import { Influencer } from "../influencer/influencer.model"
import {RequestType} from "../../utils/enum"

@Entity({ name: "ratings" })
export class Rating extends BaseModel {
  @Column()
  rating: number

  @Column()
  review_message: string

  @Column({type: "enum", enum: RequestType})
  request_type: RequestType

  @ManyToOne(() => User)
  @JoinColumn()
  user: User

  @ManyToOne(() => Influencer, (influencer) => influencer.ratings)
  @JoinColumn()
  influencer: Influencer

}