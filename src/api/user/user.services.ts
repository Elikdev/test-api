import { BaseService } from "../../helpers/db.helper";
import {User} from './user.model'



class UserService extends BaseService{
    super:any

    public async findOneUser(handle:string,email:string,phone_number:string){
        return await this.findOne(User,{
            where:[
                {handle},{email},{phone_number}
            ]
        })
    }

}

export const userService = new UserService()