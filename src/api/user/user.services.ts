import { DeepPartial } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { User } from './user.model'
import { getRepository, Like } from "typeorm"
import { AccountType, jwtCred, RoleType } from "../../utils/enum"
import { AuthModule } from "../../utils/auth"



class UserService extends BaseService{
    super:any

    public async findOneUser(handle:string,email:string,phone_number:string){
        return await this.findOne(User,{
            where:[
                {handle},{email},{phone_number}
            ]
        })
    }

    public async findUserWithOtp(email: string, otp_code: string) {
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
        profile_image: string
        bio: string
    }) {
        const user_id = authUser.id
        
        const user = await this.getUserDetails(user_id)

        if(!user){
            return this.internalResponse(false, {}, 200, "Invalid user")
        }
        const { profile_image, bio } = userDTO

        if(!profile_image && !bio) {
            return this.internalResponse(false, {}, 400, "No data to update")
        }

        const update_details = {
            profile_image: userDTO?.profile_image,
            bio: userDTO?.bio
        }

        //update user
        const result = await this.updateUser(user, update_details)

        const {password, ...data} = result

        return this.internalResponse(true, data, 200, "Profile updated")
    }

    public async changePassword(authUser: jwtCred, userDTO: {
        old_password: string
        new_password: string
        confirm_password: string
    }) {
        const user_email = authUser.email;

        const user = await this.findUserWithEmail(user_email)

        if (!user) {
            return this.internalResponse(false, {}, 200, "Invalid user")
        }

        const isPasswordValid = AuthModule.compareHash(userDTO.old_password, user.password);
        if (!isPasswordValid) {
            return this.internalResponse(
            false,
            {},
            400,
            "Incorrect Password entered"
            )
        }

        const hashedPassword = AuthModule.hashPassWord(userDTO.new_password)

        const update_details = {
            password: hashedPassword,
        }

        const result =  await userService.updateUser(user, update_details);
        if (!result) {
            return this.internalResponse(false, {}, 400, "Could not update user's password")
        }

        return this.internalResponse(true, {}, 200, "Password updated")
    }

    public async findUserWithId(id: number): Promise<User> {
        return await this.findOne(User, {
            where: {
                id,
            },
        })
    }

    public async findUserWithIndustry(userId: number): Promise<User>{
        return await this.findOne(User, {
            where: {
                id: userId,
            },
            relations: ["industry"]
        })
    }

    public async aggregateUserDetails(id: number, account_type: string): Promise<User> {
        const user_ralations = [
            "wallet", 
            "transactions", 
            "requests", 
            "followers", 
            "following", 
            "industry", 
            "influencer_requests", 
            "fan_requests"
        ]
        
        if (account_type === "celebrity") {
            user_ralations.push("banks", "ratings");
        }

        const user = await this.findOne(User, {
            where: {
                id
            }
        })

        delete user.password
        delete user.email_verification
        
        return user
    }

    public async tempDeleteUser(id:string){
        const user = await this.findUserWithId(Number(id))
        if(!user){
            throw new Error(' invalid user id')
        }
        const deleteUser = await this.deleteOne(User,{
                id
        })
        
        if(!deleteUser){
            throw new Error('undable to delete user')
        }

        return `user with is ${id} deleted successfully`
        
    }

    public async findAllUsers(account_type: AccountType) {
        const [users, count] = await getRepository(User).findAndCount({
            where: {account_type: account_type, role: RoleType.BAMIKI_USER}
        })

        return count
    }

    public async findAllVerifiedUsers() {
        const [users, count] = await getRepository(User).findAndCount({
            where: {is_verified: true, role: RoleType.BAMIKI_USER}
        })

        if(users.length >= 0) {
            for (const user of users) {
                delete user.password
                delete user.email_verification
            }
        }
        
        return {count, users}
    }

}

export const userService = new UserService()
