import {BaseService} from "../../enums";
import {User} from "./user.model";
import {getRepository} from "typeorm";

class UserServices extends BaseService {
    public async getUser(id: number){
        const userDetails = await this.getOne(User, id)
        if(!userDetails){
            return this.internalResponse(false, {},404, "not found")
        }
        return  this.internalResponse(true, userDetails)
    }

    public async SignUp (userDTO: User){
        let user = await getRepository(User).findOne({
            where: [
                {email: userDTO.email},
                {username: userDTO.username},
            ]
        })
        if (user){
            let message :string;
            if ( user.email === userDTO.email){
                message = 'email already exists'
            }
            if(user.username === userDTO.username ){
                message = 'username already exists'
            }
            return this.internalResponse(false, {} , 400, message)
        }
        user = await  getRepository(User).save(userDTO)

        return  this.internalResponse(true, user)
    }
}

export const userService = new UserServices()