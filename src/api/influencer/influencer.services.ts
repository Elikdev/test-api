import moment from "moment"
import {
  DeepPartial,
  getRepository,
  Like,
  Not,
  Equal,
  MoreThanOrEqual,
  getManager,
  getConnection,
} from "typeorm"
import { BaseService } from "../../helpers/db.helper"
import { AuthModule } from "../../utils/auth"
import {
  AccountType,
  jwtCred,
  LiveVideoVerificationStatus,
  RoleType,
} from "../../utils/enum"
import { User } from "../user/user.model"
import { userService } from "../user/user.services"
import { Influencer } from "./influencer.model"
// import client from "../../utils/redis"

class InfluencerService extends BaseService {
  super: any

  public newInfluencerInstance(
    full_name: string,
    password: string,
    email: string,
    handle: string,
    country_code: number,
    phone_number: string,
    social_media_link: string,
    live_video: string,
    account_type: string,
    referral_code: string,
    referred_by: any
  ) {
    const celeb = new Influencer()
    celeb.full_name = full_name
    celeb.password = password
    celeb.email = email
    celeb.handle = handle
    celeb.country_code = country_code
    celeb.phone_number = phone_number
    celeb.social_media_link = social_media_link
    celeb.live_video = live_video
    celeb.account_type = account_type
    celeb.referral_code = referral_code
    celeb.referred_by = referred_by
    celeb.referral_count = 0
    return celeb
  }

  public async createInfluencer(celeb: Influencer) {
    return await this.save(Influencer, celeb)
  }

  public async findInfluencerWithEmail(email: string) {
    return await this.findOne(Influencer, {
      where: {
        email,
      },
    })
  }

  public async updateInfluencer(
    userToUpdate: Influencer,
    updateFields: DeepPartial<Influencer>
  ) {
    this.schema(Influencer).merge(userToUpdate, updateFields)
    return await this.updateOne(Influencer, userToUpdate)
  }

  public async findInfluencerById(id: number) {
    const influencer = await this.getOne(Influencer, id)
    return influencer
  }

  public async findInfluencerByRefCode(ref: any) {
    const user = await this.findOne(Influencer, {
      where: {
        referral_code: ref,
        is_admin_verified: true,
      },
    })

    return user
  }

  public async findInfluencer(search: string) {
    const influencer_list = await this.getMany(Influencer, {
      where: [
        { full_name: Like(`%${search}%`) },
        { handle: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        // { industry: Like(`%${search}%`) },
      ],
    })
    return influencer_list
  }

  public async setRate(type: string, amount: number, id: number) {
    try {
      const influencer = await this.findInfluencerById(id)

      if (!influencer) {
        return this.internalResponse(
          false,
          {},
          400,
          "Influencer does not exist"
        )
      }

      if (type === "dm") {
        return await this.updateInfluencer(influencer, { rate_dm: amount })
      }
      if (type === "shoutout") {
        return await this.updateInfluencer(influencer, {
          rate_shout_out: amount,
        })
      }
    } catch (error) {
      throw error
    }
  }

  public async setTransactionPin(authUser: jwtCred, setPinDTO:{pin: string; confirm_pin: string}){
    const user_id = authUser.id

    const influencer = await this.findInfluencerById(user_id)

    if(!influencer){
      return this.internalResponse(false, {}, 400, "Influencer not found")
    }

    //check if user has set his transaction pin
    if(influencer.transaction_pin){
      return this.internalResponse(false, {}, 400, "Transaction pin has been set initially set")
    }

    //hash transaction pin
    let {pin, confirm_pin} = setPinDTO

    pin = AuthModule.hashPassWord(pin)

    const update_details = {
      transaction_pin: pin
    }

    const influencer_update = await this.updateInfluencer(influencer, update_details)

    if(!influencer_update) {
      return this.internalResponse(false, {}, 400, "Error in updating user")
    }

    return this.internalResponse(true, {}, 200, "Transaction pin set successfully")
  }

  public async changeTransactionPin(
    authUser: jwtCred, 
    setPinDTO: {old_pin: string; new_pin: string; confirm_pin: string }
  ) {
    const user_id = authUser.id

    const influencer = await this.findInfluencerById(user_id)

    if (!influencer) {
      return this.internalResponse(false, {}, 400, "influencer not found")
    }

    let { old_pin, new_pin, confirm_pin } = setPinDTO

    //verify the old_pin
    if (!old_pin) {
      return this.internalResponse(false, {}, 400, "Enter your old_pin")
    }

    const pin_verified = AuthModule.compareHash(
      old_pin,
      influencer.transaction_pin
    )

    if (!pin_verified) {
      return this.internalResponse(false, {}, 400, "Pin incorrect")
    }

    if (pin_verified && !new_pin && !confirm_pin) {
      return this.internalResponse(false, {}, 400, "Enter your new_pin")
    }

    //hash pin
    new_pin = AuthModule.hashPassWord(new_pin)

    const update_details = {
      transaction_pin: new_pin,
    }

    const influencer_update = await this.updateInfluencer(
      influencer,
      update_details
    )

    if (!influencer_update) {
      return this.internalResponse(false, {}, 400, "Error in updating user")
    }

    return this.internalResponse(
      true,
      {},
      200,
      "Transaction pin set successfully"
    )
  }

  public async getAllInfluencers(
    authUser: jwtCred,
    iDTO: { page: number; limit: number }
  ) {
    const user_id = authUser.id

    const { page, limit } = iDTO
    const offset = limit * (page - 1)

    //find the user
    const user_exists = await userService.findUserWithId(user_id)

    if (!user_exists) {
      return this.internalResponse(false, {}, 400, "Invalid user")
    }

    const [list, count] = await getRepository(Influencer).findAndCount({
      where: { account_type: "celebrity", id: Not(Equal(user_id)) },
      skip: offset,
      take: limit,
    })

    if (list.length <= 0) {
      return this.internalResponse(
        false,
        {},
        400,
        "There are no influencers on the platform"
      )
    }

    let list_full = []

    for (const influencer of list) {
      delete influencer.password
      delete influencer.email_verification
      delete influencer.is_admin_verified
      const full_details = await userService.aggregateUserDetails(
        influencer.id,
        influencer.account_type
      )
      list_full.push(full_details)
    }

    const response_data = {
      influencers: list_full,
      total_number: count,
      number_of_pages: Math.ceil(count / limit),
    }

    return this.internalResponse(
      true,
      response_data,
      200,
      "Influencers retrieved"
    )
  }

  public async getOneInfluncer(authUser: jwtCred, iDTO: { id: number }) {
    const user_id = authUser.id

    const { id } = iDTO

    const user_exists = await userService.findUserWithId(user_id)

    if (!user_exists) {
      return this.internalResponse(false, {}, 400, "invalid user")
    }

    const influncer_exist = await influencerService.findInfluencerById(id)

    if (!influncer_exist) {
      return this.internalResponse(false, {}, 400, "influencer does not exist")
    }

    const full_details = await userService.aggregateUserDetails(
      influncer_exist.id,
      influncer_exist.account_type
    )

    return this.internalResponse(
      true,
      full_details,
      200,
      "Influencer details retrieved"
    )
  }

  public async getInfluencerWithVerifications(admin_verified) {
    const celebrities = await getRepository(Influencer).find({
      where: { is_admin_verified: admin_verified },
      order: { updated_at: "DESC" },
    })

    let data = []

    if (celebrities.length > 0) {
      data = AuthModule.removeDetailsfromUserData(celebrities)
    }

    return data
  }

  public async getInfluencersForAdmin() {
    const [list, count] = await getRepository(User).findAndCount({
      where: { account_type: AccountType.CELEB, role: RoleType.BAMIKI_USER },
      order: { created_at: "DESC" },
      relations: [
        "influencer_requests",
        "fan_requests",
        "transactions",
        "shout_out_videos",
        "ratings",
        "followers",
        "wallet",
      ],
    })

    if (list.length > 0) {
      for (const influencer of list) {
        delete influencer.password
        delete influencer.email_verification
      }
    }

    return {
      list,
      count,
    }
  }

  public async getNewlyRegisteredInfluencers() {
    const [list, count] = await getRepository(Influencer).findAndCount({
      where: {
        live_video_verification_status: LiveVideoVerificationStatus.PENDING,
        is_admin_verified: false,
        role: RoleType.BAMIKI_USER,
      },
      order: { created_at: "DESC" },
      relations: [
        "requests",
        "transactions",
        "shout_out_videos",
        "ratings",
        "followers",
        "wallet",
      ],
    })

    if (list.length > 0) {
      for (const influencer of list) {
        delete influencer.password
        delete influencer.email_verification
      }
    }

    return {
      list,
      count,
    }
  }

  public async getUnverifiedInfluencers() {
    const [list, count] = await getRepository(Influencer).findAndCount({
      where: {
        live_video_verification_status: LiveVideoVerificationStatus.DECLINED,
        is_admin_verified: false,
        role: RoleType.BAMIKI_USER,
      },
      order: { updated_at: "DESC" },
      relations: [
        "requests",
        "transactions",
        "shout_out_videos",
        "ratings",
        "followers",
        "wallet",
      ],
    })

    if (list.length > 0) {
      for (const influencer of list) {
        delete influencer.password
        delete influencer.email_verification
      }
    }

    return {
      list,
      count,
    }
  }

  public async getVerifiedInfluencers() {
    const [list, count] = await getRepository(Influencer).findAndCount({
      where: {
        live_video_verification_status: LiveVideoVerificationStatus.VERIFIED,
        is_admin_verified: true,
        role: RoleType.BAMIKI_USER,
      },
      order: { updated_at: "DESC" },
      relations: [
        "requests",
        "transactions",
        "shout_out_videos",
        "ratings",
        "followers",
        "wallet",
      ],
    })

    if (list.length > 0) {
      for (const influencer of list) {
        delete influencer.password
        delete influencer.email_verification
      }
    }

    return {
      list,
      count,
    }
  }

  public async getNewInfluencers(iDTO: { page: number; limit: number }, authUser:jwtCred) {
    const { page, limit } = iDTO
    const offset = (page - 1) * limit
    const { id } = authUser

    //use momnet to grab the sstart of the month
    const startMonth = moment().startOf("month")
    const [list, count] = await getRepository(User).findAndCount({
      where: {
        account_type: AccountType.CELEB,
        created_at: MoreThanOrEqual(startMonth),
        is_verified: true,
        id: Not(Equal(id))
      },
      order: { created_at: "DESC" },
      relations: [
        "influencer_requests",
        "fan_requests",
        "transactions",
        "shout_out_videos",
        "ratings",
        "followers",
        "wallet",
      ],
      take: limit,
      skip: offset,
    })

    if (list.length > 0) {
      for (const influencer of list) {
        delete influencer.password
        delete influencer.email_verification
      }
    }

    return this.internalResponse(
      true,
      { list, count },
      200,
      "New influencers retrieved!"
    )
  }

  // public async getFeaturedInfluencers(authUser: jwtCred) {
  //   const { id } = authUser
  //   //get the influencers from the featured influencers
  //   let results = []
  //   //choose the best influencers with the highest rating
  //   if (results.length <= 0) {
  //     const [list, count] = await getRepository(Influencer).findAndCount({
  //       where: {
  //         is_verified: true,
  //         average_rating: MoreThanOrEqual("3.5"),
  //         id: Not(Equal(id)),
  //       },
  //       order: { average_rating: "DESC" },
  //       relations: [
  //         "influencer_requests",
  //         "fan_requests",
  //         "transactions",
  //         "shout_out_videos",
  //         "ratings",
  //         "followers",
  //         "wallet",
  //       ],
  //       take: 10,
  //     })

  //     results = list
  //   }

  //   let total_length: any

  //   if (results.length < 10) {
  //     const [list, count] = await getRepository(Influencer).findAndCount({
  //       where: { is_verified: true, id: Not(Equal(id)) },
  //       relations: [
  //         "influencer_requests",
  //         "fan_requests",
  //         "transactions",
  //         "ratings",
  //         "followers",
  //         "wallet",
  //       ],
  //     })

  //     //sort the fan that has the highest number of requests
  //     list.sort((a, b) =>
  //       a.influencer_requests.length > b.influencer_requests.length
  //         ? -1
  //         : b.influencer_requests.length > a.influencer_requests.length
  //         ? 1
  //         : 0
  //     )

  //     //push to results
  //     for (const infl of list) {
  //       results.push(infl)

  //       if (results.length === 10) {
  //         break
  //       }
  //     }
  //     total_length = results.length
  //   }

  //   if (total_length < 10) {
  //     const query = await getConnection()
  //       .createQueryBuilder()
  //       .select("*")
  //       .from(Influencer, "influencers")
  //       .where(`NOT("id" = ${id})`)
  //       .orderBy("RANDOM()")
  //       .limit(6)
  //       .execute()

  //     for (const infl of query) {
  //       results?.push(infl)

  //       if (results?.length === 10) {
  //         break
  //       }
  //     }
  //   }
  //   //display them as featured
  //   if (results.length > 0) {
  //     //remove duplicates
  //     results = results.filter(
  //       (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  //     )

  //     for (const influencer of results) {
  //       delete influencer?.password
  //       delete influencer?.email_verification
  //       delete influencer?.wallet
  //       delete influencer?.fan_requests
  //       delete influencer?.influencer_requests
  //       delete influencer?.transactions
  //     }
  //   }

  //   return this.internalResponse(
  //     true,
  //     results,
  //     200,
  //     "Featured influencers retrieved!"
  //   )
  // }

  // public async getSpotlight(authUser: jwtCred) {
  //   const { id } = authUser

  //   let rest

  //   //check if the redis has it
  //   const results = await client.get("spotlights")
  //   if (results == null) {
  //     const query = await getConnection()
  //       .createQueryBuilder()
  //       .select("*")
  //       .from(Influencer, "influencers")
  //       .where(`NOT("id" = ${id})`)
  //       .orderBy("RANDOM()")
  //       .limit(6)
  //       .execute()

  //     if (query.length > 0) {
  //       for (const q of query) {
  //         delete q.password
  //         delete q.email_verification
  //         delete q.wallet
  //         delete q.fan_requestss
  //         delete q.influencer_requests
  //         delete q.transactions
  //       }

  //       await client.SETEX("spotlights", 604800, JSON.stringify(query))
  //       rest = query
  //     }
  //   } else {
  //     console.log("fetching from redis")
  //     rest = JSON.parse(results)
  //   }

  //   return this.internalResponse(true, rest, 200, "spotlights retrieved!")
  // }
}

export const influencerService = new InfluencerService()
