import { DeepPartial, getRepository } from "typeorm";
import { Rating } from "./ratings.model"
import { BaseService } from "../../helpers/db.helper"
import { User } from "../user/user.model"
import { Influencer } from "../influencer/influencer.model"
import { influencerService } from "../influencer/influencer.services"
import { userService } from "../user/user.services"
import { jwtCred, RequestType } from "../../utils/enum"

class RatingService extends BaseService {
  super: any

  public async ratingInstance(
    rating: number,
    review_message: string,
    request_type: RequestType,
    user: User,
    influencer: Influencer
  ) {
    const new_rating = new Rating()

    new_rating.rating = rating
    new_rating.review_message = review_message
    new_rating.request_type = request_type
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

  public async findExistingRating(
    userId: number,
    influencerId: number,
    request_type: RequestType
  ) {
    return await this.findOne(Rating, {
      where: {
        user: userId,
        influencer: influencerId,
        request_type: request_type,
      },
      relations: ["user", "influencer"],
    })
  }

  public async findAllInfluencerRating(influencerId: number) {
    return await this.schema(Rating).find({
      where: { influencer: influencerId },
    })
  }

  public async findAllInfluencerRatingByType(
    influencerId: number,
    request_type: RequestType
  ) {
    return await this.schema(Rating).find({
      where: { influencer: influencerId, request_type },
    })
  }

  public async updateRating(
    ratingToUpdate: Rating,
    updateFields: DeepPartial<Rating>
  ) {
    this.schema(Rating).merge(ratingToUpdate, updateFields)
    const updated_rating = await this.updateOne(Rating, ratingToUpdate)

    const { user, influencer, ...result } = updated_rating

    const updated_result = {
      ...result,
      user_id: updated_rating.user?.id,
      influencer_id: updated_rating.influencer?.id,
    }

    return updated_result
  }

  public async newRating(
    authUser: jwtCred,
    ratingDTO: {
      rating: number
      review_message: string
      request_type: RequestType
      influencerId: number
    }
  ) {
    const user_id = authUser.id
    //search for influencer
    const influencer_exists = await influencerService.findInfluencerById(
      ratingDTO.influencerId
    )

    if (!influencer_exists) {
      return this.internalResponse(false, {}, 400, "Influencer does not exist")
    }

    //get the user data
    const user = await userService.findUserWithId(user_id)

    //check if the user has rated the influencer initially
    const rating_exists = await this.findExistingRating(
      user.id,
      influencer_exists.id,
      ratingDTO.request_type
    )

    let newRating: any

    if (rating_exists) {
      const update_details = {
        rating: ratingDTO.rating,
        review_message: ratingDTO?.review_message,
      }

      newRating = await this.updateRating(rating_exists, update_details)
    } else {
      //new rating
      const new_rating = await this.ratingInstance(
        ratingDTO.rating,
        ratingDTO.review_message,
        ratingDTO.request_type,
        user,
        influencer_exists
      )

      newRating = await this.saveRating(new_rating)
    }

    if (!newRating) {
      return this.internalResponse(false, {}, 400, "Failed to save the rating")
    }

    //update the average rating
    const allRating = await this.findAllInfluencerRating(influencer_exists.id)
    const allRequestRating = await this.findAllInfluencerRatingByType(
      influencer_exists.id,
      ratingDTO.request_type
    )

    //totalRating
    const totalRates = allRating.reduce((acc, currentRate) => {
      return acc + parseFloat(currentRate.rating.toString())
    }, 0)

    const totalReqRating = allRequestRating.reduce((acc, currentRate) => {
      return acc + parseFloat(currentRate.rating.toString())
    }, 0)

    if (ratingDTO.request_type === RequestType.SHOUT_OUT) {
      const average_shout_out_rating = (
        totalReqRating / allRequestRating.length
      ).toFixed(1)

      await influencerService.updateInfluencer(influencer_exists, {
        average_shout_out_rating,
      })
    }

    if (ratingDTO.request_type === RequestType.DM) {
      const average_dm_rating = (
        totalReqRating / allRequestRating.length
      ).toFixed(1)

      await influencerService.updateInfluencer(influencer_exists, {
        average_dm_rating,
      })
    }

    const {
      average_dm_rating: avg_dm_rating,
      average_shout_out_rating: avg_so_rating,
    } = influencer_exists

    const avgRat =
      avg_dm_rating && avg_so_rating
        ? ((parseFloat(avg_dm_rating) + parseFloat(avg_so_rating)) / 2).toFixed(
            1
          )
        : avg_dm_rating
        ? parseFloat(avg_dm_rating).toFixed(1)
        : avg_so_rating
        ? parseFloat(avg_so_rating).toFixed(1)
        : null

    const update_details = {
      average_rating: avgRat,
    }

    const updateInfluencer = await influencerService.updateInfluencer(
      influencer_exists,
      update_details
    )

    if (!updateInfluencer) {
      return this.internalResponse(
        false,
        {},
        400,
        "Failed to update influencer's average rating"
      )
    }

    return this.internalResponse(true, newRating, 200, "Rating saved")
  }

  public async allReviewsForInfluencer(influencerId: number) {
    const reviews = await this.findAllInfluencerRating(influencerId)

    if (reviews.length <= 0) {
      return this.internalResponse(
        false,
        { reviews: [] },
        400,
        "No reviews/rating available yet"
      )
    }

    return this.internalResponse(
      true,
      reviews,
      200,
      "All reviews/ratings retrieved!"
    )
  }
}

export const ratingService = new RatingService()
