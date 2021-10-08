import { BaseService } from "../../helpers/db.helper";
import { Fan } from "./fan.model";

class FanService extends BaseService{
    super:any

    public async newFan(full_name:string, password:string, email:string, handle:string,country_code:number, phone_number:string, account_type: string){
        const fan =  new Fan()
        fan.full_name = full_name
        fan.password = password
        fan.email = email
        fan.handle = handle
        fan.country_code = country_code
        fan.phone_number = phone_number
        fan.account_type = account_type
        return await this.createFan(fan)
    }

    public async createFan(fan:Fan){
        return await this.save(Fan,fan)
    }
}

export const fanService = new FanService()