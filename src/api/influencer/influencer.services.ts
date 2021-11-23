import { DeepPartial, getRepository, Like, Not, Equal } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { jwtCred } from "../../utils/enum";
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
    referred_by: any,
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
        is_admin_verified: true
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


  public async setRate(type:string, amount:number, id:number){
    try{
      const influencer = await this.findInfluencerById(id)

      if(!influencer) {
        return this.internalResponse(false, {}, 400, "Influencer does not exist")
      }
      
      if(type === 'dm'){
        return await this.updateInfluencer(influencer,{rate_dm:amount})
      }
      if(type === 'shoutout'){
        return await this.updateInfluencer(influencer,{rate_shout_out:amount})
      }
    }catch(error){
      throw error
    }

  }

  public async getAllInfluencers(authUser:jwtCred, iDTO: {page: number,  limit: number}) {
    const user_id = authUser.id;

    const {page, limit} = iDTO
    const offset = limit * (page - 1)

    //find the user
    const user_exists = await userService.findUserWithId(user_id)

    if(!user_exists) {
      return this.internalResponse(false, {}, 400, "Invalid user")
    }

    const [list, count] = await getRepository(Influencer).findAndCount({
      where: {account_type: "celebrity", id: Not(Equal(user_id))},
      skip: offset,
      take: limit
    })

    if(list.length <= 0) {
      return this.internalResponse(false, {}, 400, "There are no influencers on the platform")
    }

    for (const influencer of list) {
      delete influencer.password
      delete influencer.email_verification
      delete influencer.is_admin_verified
    }

    const response_data = {
      influencers: list,
      total_number: count,
      number_of_pages: Math.ceil(count / limit)
    }

    return this.internalResponse(true, response_data, 200, "Influencers retrieved")
  }

}

export const influencerService = new InfluencerService()
