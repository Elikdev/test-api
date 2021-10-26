import { Industry } from "./industry.model"
import { BaseService } from "../../helpers/db.helper"
import { userService } from "../user/user.services"
import { jwtCred, Industry as IndustryEnum } from "../../utils/enum"
import { IndustriesOption } from "./IndustryOptions/industries"

class IndustryService extends BaseService {
  super: any

  public async addUserIndustries(authUser: jwtCred, interestDTO: IndustryEnum[]) {
    const user_id = authUser.id

    let user = await userService.findUserWithIndustry(user_id)

    // if no industry/specialty/interest create a new one 
    if (!user.industry) {
        const industry = await this.create(Industry, {
            industries: interestDTO
        })
        user.industry = industry
        await this.schema(Industry).insert(industry)
        
    } else {
        // save industry and add to industry column
        const industry = await this.updateOne(Industry, {
            ...user.industry,
            industries: interestDTO
        })
        user.industry = industry
    }

    // update that particular user row
    user = await userService.saveUser(user)

    return this.internalResponse(
        true, 
        { ...user.industry }, 
        200, 
        `${user.account_type == "celebrity" ? 'industry' : 'interest'} updated successfully`
    )
  }
  
  public getAllIndustries() {
    return this.internalResponse(true, IndustriesOption, 200, "all industies fetched")
  }
}

export const industryService = new IndustryService()
