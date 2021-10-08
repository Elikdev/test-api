import { BaseService } from "../../helpers/db.helper";
import {User} from './user.model'
import {getRepository, Like} from "typeorm"



class UserService extends BaseService{
    super:any

    public async findOneUser(handle:string,email:string,phone_number:string){
        return await this.findOne(User,{
            where:[
                {handle},{email},{phone_number}
            ]
        })
    }

    public async findUserWithOtp(email: string, otp_code) {
        return await getRepository(User).createQueryBuilder().where(`User.email_verification ::jsonb @> :email_verification AND User.email = :email`, {
            email_verification: {
                otp_code: otp_code.toString()
            },
            email: email
        }).getOne()
    }
}

export const userService = new UserService()
