import { getRepository } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { AccountType, RoleType } from "../../utils/enum";
import { User } from "../user/user.model";
import { Fan } from "./fan.model";

class FanService extends BaseService {
  super: any

  public async newFan(
    full_name: string,
    password: string,
    email: string,
    handle: string,
    country_code: number,
    phone_number: string,
    account_type: string,
    referred_by: any
  ) {
    const fan = new Fan()
    fan.full_name = full_name
    fan.password = password
    fan.email = email
    fan.handle = handle
    fan.country_code = country_code
    fan.phone_number = phone_number
    fan.account_type = account_type
    fan.referred_by = referred_by
    return await this.createFan(fan)
  }

  public async createFan(fan: Fan) {
    return await this.save(Fan, fan)
  }

  public async findFanById(id: number) {
    return await this.findOne(Fan, { where: { id } })
  }

  
  public async getFansForAdmin() {
    const [list, count] = await getRepository(User).findAndCount({
      where: {account_type: AccountType.FAN, role: RoleType.BAMIKI_USER},
      order: {created_at: "DESC"},
      relations: ["fan_requests", "transactions", "following", "wallet"]
    }) 


    if(list.length > 0) {
      for (const fan of list) {
        delete fan.password
        delete fan.email_verification
      }
    }

    return {
      list,
      count
    }
  }
}

export const fanService = new FanService()