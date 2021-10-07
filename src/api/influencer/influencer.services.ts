import { BaseService } from "../../helpers/db.helper";
import { Influencer } from "./influencer.model";




class InfluencerService extends BaseService{
    super:any

    public newinfluencerInstance(full_name:string, password:string, email:string, handle:string,country_code:number, phone_number:string, social_media_link:string,live_video:string){
        const celeb = new Influencer()
        celeb.full_name = full_name
        celeb.password = password
        celeb.email = email
        celeb.handle = handle
        celeb.country_code = country_code
        celeb.phone_number =  phone_number
        celeb.social_media_link = social_media_link
        celeb.live_video = live_video
        return celeb
    }

    public async createInfluencer(celeb:Influencer){
        return await this.save(Influencer, celeb)
    }
}

export const influencerService = new InfluencerService()