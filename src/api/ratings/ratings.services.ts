import { Rating } from "./ratings.model"
import { BaseService } from "../../helpers/db.helper"
import { User } from "../user/user.model"
import { Influencer } from "../influencer/influencer.model"
import { influencerService } from "../influencer/influencer.services"
import { userService } from "../user/user.services"

class RatingService extends BaseService {
  super: any

  public async ratingInstance(
    rating: number,
    review_message: string,
    user: User,
    influencer: Influencer
  ) {
    const new_rating = new Rating()

    new_rating.rating = rating
    new_rating.review_message = review_message
    new_rating.user = user
    new_rating.influencer = influencer

    return new_rating
  }

  public async saveRating(rating: Rating) {
    const saved_rating = await this.save(Rating, rating)

    const { user, influencer, ...result } = saved_rating

    const updated_result = {
      ...result,
      user_id: saved_rating.user?.id,
      influencer_id: saved_rating.influencer?.id,
    }

    return updated_result
  }

  public async newRating(
    authUser,
    ratingDTO: { rating: number; review_message: string; influencerId: number }
  ) {
    const user_id = authUser.id
    //search for influencer
    const influencer_exists = await influencerService.findInfluencerById(
      ratingDTO.influencerId
    )

    if (!influencer_exists) {
      return this.internalResponse(false, {}, 400, "Invalid influencer ID")
    }

    //get the user data
    const user = await userService.findUserWithId(user_id)

    //new rating
    const new_rating = await this.ratingInstance(
      ratingDTO.rating,
      ratingDTO.review_message,
      user,
      influencer_exists
    )

    const newRating = await this.saveRating(new_rating)

    if (!newRating) {
      return this.internalResponse(false, {}, 400, "Failed to save the rating")
    }

    return this.internalResponse(true, newRating, 200, "Rating saved")
  }
}

export const ratingService = new RatingService()
