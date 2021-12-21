import { DeepPartial, getRepository, Like, Not, Equal } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { AuthModule } from "../../utils/auth";
import { AccountType, jwtCred, LiveVideoVerificationStatus, RoleType } from "../../utils/enum";
import { User } from "../user/user.model";
import { userService } from "../user/user.services";
import { Influencer } from "./influencer.model";


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

  public async getNewlyRegisteredInfluencers() {
    const [list, count] = await getRepository(Influencer).findAndCount({
      where: [
        { is_admin_verified: false, role: RoleType.BAMIKI_USER },
        { live_video_verification_status: LiveVideoVerificationStatus.PENDING, role: RoleType.BAMIKI_USER},
      ],
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
      where: [
        { is_admin_verified: false, role: RoleType.BAMIKI_USER },
        {
          live_video_verification_status: LiveVideoVerificationStatus.DECLINED,
          role: RoleType.BAMIKI_USER
        },
      ],
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
      where: [
        { is_admin_verified: true , role: RoleType.BAMIKI_USER},
        {
          live_video_verification_status: LiveVideoVerificationStatus.VERIFIED,
          role: RoleType.BAMIKI_USER
        },
      ],
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

  
}

export const influencerService = new InfluencerService()
