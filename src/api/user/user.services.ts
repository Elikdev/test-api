import { DeepPartial } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import {User} from './user.model'
import {getRepository, Like} from "typeorm"
import {jwtCred} from "../../utils/enum"



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

    public async findUserWithEmail(email: string): Promise<User> {
        return await this.findOne(User, {
            where: {
                email,
            },
        })
    }

    public async updateUser(userToUpdate: User, updateFields: DeepPartial<User>) {
       this.schema(User).merge(userToUpdate, updateFields);
       return await this.updateOne(User, userToUpdate)
    }

    public async getUserDetails(id: number) {
        const user = await this.findOne(User, {
            where: {
                id
            },
            relations: ["transactions", "requests", "followers", "following"]
        })

        delete user.password
        delete user.email_verification
        
        return user
    }

    public async saveUser(user: User) {
        return await this.save(User, user)
    }
    
    public async updateProfile(authUser:jwtCred, userDTO: {
        full_name: string
        phone_number: string
        country_code: number
        social_media_link: string
    }) {
        const user_id = authUser.id
        
        const user = await this.getUserDetails(user_id)

        if(!user){
            return this.internalResponse(false, {}, 200, "Invalid user")
        }
        const { country_code, full_name, phone_number, social_media_link } = userDTO

        if(!country_code && !full_name && !phone_number && !social_media_link) {
            return this.internalResponse(false, {}, 400, "No data to update")
        }

        const update_details = {
            full_name: userDTO?.full_name,
            phone_number: userDTO?.phone_number,
            country_code: userDTO?.country_code,
            social_media_link: userDTO?.social_media_link
        }

        //update user
        const result = await this.updateUser(user, update_details)

        const {password, ...data} = result

        return this.internalResponse(true, data, 200, "Profile updated")
    }
}

export const userService = new UserService()
