import { BaseModel } from "../../helpers/db.helper"
import { Column, Entity, ManyToOne, JoinColumn, } from "typeorm"
import { User } from  "../user/user.model"
import { Influencer } from "../influencer/influencer.model"

@Entity({ name: "ratings" })
export class Rating extends BaseModel {
  @Column()
  rating: number

  @Column()
  review_message: string

  @ManyToOne(() => User, (user) => user.all_ratings_made_for_influencer)
  @JoinColumn()
  user: User

  @ManyToOne(() => Influencer, (influencer) => influencer.ratings)
  @JoinColumn()
  influencer: Influencer

}