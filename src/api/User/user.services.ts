import { AccountType, BaseService } from "../../enums";
import { User } from "./user.model";
import { getRepository } from "typeorm";
import { AuthModule } from "../../utils/auth";

class UserServices extends BaseService {
    public async getUser(id: number) {
        const userDetails = await this.getOne(User, id)
        if (!userDetails) {
            return this.internalResponse(false, {}, 404, "not found")
        }
        return this.internalResponse(true, userDetails)
    }

    public async SignUp(userDTO: {
        account_type: AccountType,
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        user_name: string,
        password: string,
    }) {
        let user = await getRepository(User).findOne({
            where: [
                { email: userDTO.email },
                { username: userDTO.user_name },
                { phone: userDTO.phone }
            ]
        })
        if (user) {
            let message: string;
            if (user.email === userDTO.email) {
                message = 'email already exists'
            }
            if (user.username === userDTO.user_name) {
                message = 'username already exists'
            }
            if (user.phone === userDTO.phone) {
                message = 'phone number  already exists.'
            }
            return this.internalResponse(false, {}, 400, message)
        }

        const hashPassword = AuthModule.hashPassWord(userDTO.password)

        user = getRepository(User).create({
            firstName: userDTO.first_name,
            lastName: userDTO.last_name,
            phone: userDTO.phone,
            account_type: userDTO.account_type,
            email: userDTO.email,
            password: hashPassword,
            username: userDTO.user_name
        })

        user = await getRepository(User).save(user)

        delete user.password

        return this.internalResponse(true, user)
    }
}

export const userService = new UserServices()