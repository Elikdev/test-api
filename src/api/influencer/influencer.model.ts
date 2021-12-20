import { ChildEntity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { User } from "../user/user.model"
import { Wallet } from "../wallet/wallet.model"
import { Bank } from "../bank/bank.model"
import { Rating } from "../ratings/ratings.model"
import { ShoutOutVideos } from "../requests/shoutOut.model"
import { LiveVideoVerificationStatus } from "../../utils/enum"

@ChildEntity()
export class Influencer extends User {
  @Column()
  social_media_link: string

  @Column()
  live_video: string

  @Column({ default: false })
  is_admin_verified: boolean

  @Column({type: "enum", enum: LiveVideoVerificationStatus, default: LiveVideoVerificationStatus.PENDING})
  live_video_verification_status: LiveVideoVerificationStatus

  @Column()
  referral_code: string

  @Column()
  referral_count: number

  @Column()
  average_shout_out_rating: string

  @Column()
  average_dm_rating: string

  @Column()
  average_rating: string

  @OneToMany(() => Bank, (bank) => bank.user)
  banks: Bank[]

  @OneToMany(() => Rating, (ratings) => ratings.influencer)
  ratings: Rating[]

  @Column()
  rate_dm:number

  @Column()
  rate_shout_out:number

  @OneToMany(() => ShoutOutVideos, (sov) => sov.influencer)
  shout_out_videos: ShoutOutVideos[]
}
