import { DeepPartial } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { Influencer } from "./influencer.model";


class InfluencerService extends BaseService{
    super:any

    public newInfluencerInstance(full_name:string, password:string, email:string, handle:string,country_code:number, phone_number:string, social_media_link:string,live_video:string, account_type: string){
        const celeb = new Influencer()
        celeb.full_name = full_name
        celeb.password = password
        celeb.email = email
        celeb.handle = handle
        celeb.country_code = country_code
        celeb.phone_number =  phone_number
        celeb.social_media_link = social_media_link
        celeb.live_video = live_video
        celeb.account_type = account_type
        return celeb
    }

    public async createInfluencer(celeb:Influencer){
        return await this.save(Influencer, celeb)
    }

    public async findInfluencerWithEmail(email: string) {
        return await this.findOne(Influencer, {
            where: {
                email,
            },
        })
    }

    public async updateInfluencer(userToUpdate: Influencer, updateFields: DeepPartial<Influencer>) {
        this.schema(Influencer).merge(userToUpdate, updateFields);
        return await this.updateOne(Influencer, userToUpdate)
    }

    public async findInfluencerById(id: number) {
        return await this.getOne(Influencer, id)
    }

    public async findAllInfluencer(search:string){
        const influencer_list = await this.findAll(Influencer)
       return influencer_list.filter(influencer=>
            influencer?.full_name?.toLowerCase()?.includes(search.toLowerCase())||
            influencer?.email?.toLowerCase()?.includes(search.toLowerCase())||
            influencer?.handle?.toLowerCase()?.includes(search.toLowerCase())||
            influencer?.industry?.includes(search.toLowerCase()))
    }

}

export const influencerService = new InfluencerService()
