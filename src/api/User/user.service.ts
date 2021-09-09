import { AccountType, BaseService, jwtCred, Gender, AccountStatus, ChannelType } from "../../enums";
import { User } from "./user.model";
import { Auth_cred } from "./authCred.model";
import { getRepository } from "typeorm";
import { AuthModule } from "../../utils/auth";
import { Wallet } from "../Wallet/wallet.model";

class UserServices extends BaseService {
    super;
    public async getUser(id: number) {
        const userDetails = await this.getOne(User, id);
        if (!userDetails) {
            return this.internalResponse(false, {}, 404, "not found");
        }
        return this.internalResponse(true, userDetails);
    }

    public async SignUp(userDTO: {
        account_type: AccountType;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        user_name: string;
        password: string;
    }) {
        let user = await getRepository(User).findOne({
            where: [
                { email: userDTO.email },
                { username: userDTO.user_name },
                { phone: userDTO.phone },
            ],
        });
        if (user) {
            let message: string;
            if (user.email === userDTO.email) {
                message = "email already exists";
            }
            if (user.username === userDTO.user_name) {
                message = "username already exists";
            }
            if (user.phone === userDTO.phone) {
                message = "phone number  already exists.";
            }
            return this.internalResponse(false, {}, 400, message);
        }

        const hashPassword = AuthModule.hashPassWord(userDTO.password);

        user = getRepository(User).create({
            firstName: userDTO.first_name,
            lastName: userDTO.last_name,
            phone: userDTO.phone,
            account_type: userDTO.account_type,
            email: userDTO.email,
            password: hashPassword,
            username: userDTO.user_name,
        });

        user = await this.save(User, user);
        let wallet
        if (user) {
            wallet = await this.create(Wallet, {
                user: user
            })
            await this.save(Wallet, wallet)
        }

        delete user.password;

        return this.internalResponse(true, {...user, balance: 0});
    }

    public async signIn(userDTO: { email: string; password: string }) {
        const user = await this.findOne(User, {
            where: {
                email: userDTO.email,
            },
        });

        if (!user) {
            return this.internalResponse(false, {}, 400, "Incorrect Email or Password!");
        }

        const validated = AuthModule.compareHash(userDTO.password, user.password);

        if (!validated) {
            return this.internalResponse(false, {}, 400, "Incorrect Email or Password!");
        }

        const token = AuthModule.generateJWT({
            id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username,
        });

        return this.internalResponse(true, { token });
    }

    public async forgotPassword(userDTO: { email: string; channel: ChannelType }) {
        //check if email is registered
        const user_exists = await this.findOne(User, {
            where: {
                email: userDTO.email,
            }
        })

        if (!user_exists) {
            return this.internalResponse(false, {}, 400, 'Email is not registered')
        }

        //check if user status is pending or disabled -- testing (Add AccountStatus.PENDING) 
        if (user_exists.status === AccountStatus.DISABLED) {
            return this.internalResponse(false, {}, 400, 'Account disabled, contact support')
        }

        //generate otp
        const otp = AuthModule.generateOtp(6);
        const expiry_time = new Date(Date.now() + 18000000)//5hrs

        const new_otp = await getRepository(Auth_cred).create({
            OTP: otp,
            expTime: expiry_time,
            receipient: userDTO.email,
            channel: userDTO.channel,
            userId: user_exists.id
        })

        //send email to user
        const result = await this.save(Auth_cred, new_otp)

        return this.internalResponse(true, { OTP: result.OTP }, 200, "otp generated, expires in 5hrs")

    }

    public async verifyOtp(userDTO: { email: string; otp_code: string }) {
        //check if email is registered
        const auth_cred = await getRepository(Auth_cred).findOne({
            where: {
                OTP: userDTO.otp_code,
                receipient: userDTO.email

            }

        })

        if (!auth_cred) {
            return this.internalResponse(false, {}, 400, "Invalid OTP")
        }

        if (auth_cred.receipient !== userDTO.email) {
            return this.internalResponse(false, {}, 400, "Invalid email")
        }

        if (auth_cred.blackListed || auth_cred.verified) {
            return this.internalResponse(false, {}, 400, "Invalid otp")
        }

        const expir_time = new Date(auth_cred.expTime)

        //compare otp
        if (new Date(Date.now()) > expir_time) {
            return this.internalResponse(false, {}, 400, "Expired OTP code")
        }

        if (userDTO.otp_code !== auth_cred.OTP) {
            return this.internalResponse(false, {}, 400, "Invalid OTP code")
        }

        auth_cred.blackListed = true
        auth_cred.verified = true
        auth_cred.OTP = "------"

        //update auth credentials
        await this.updateOne(Auth_cred, auth_cred)


        //generate a token that will expire in 5 mins
        const token = AuthModule.createOtpToken({ id: auth_cred.userId })

        return this.internalResponse(true, { token }, 200, "otp verified")

    }

    public async resetPassword(userDTO: { token: string, new_password: string }) {
        //verify token
        const verify = AuthModule.verifyOtpToken(userDTO.token)

        if (!verify.verified) {
            return this.internalResponse(false, {}, 400, verify?.message ? verify.message : 'Unauthorized')
        }

        const user_id = verify.otpDetails.id

        if (!user_id) {
            return this.internalResponse(false, {}, 401, "Unauthorized")
        }

        const user = await this.findOne(User, {
            where: {
                id: user_id
            }
        })

        if (!user) {
            return this.internalResponse(false, {}, 400, "Unauthorized")
        }

        const hashedPassword = AuthModule.hashPassWord(userDTO.new_password)

        const new_password = {
            password: hashedPassword
        }

        //update password
        await this.schema(User).merge(user, new_password)

        await this.updateOne(User, user)

        //send mail

        return this.internalResponse(true, {}, 200, "Password reset successfully")
    }

    public async updateProfile(
        authUser: jwtCred,
        userDTO: {
            first_name: string;
            last_name: string;
            descriptions: string;
            location: string;
            date_of_birth: string;
            sex: Gender;
        }
    ) {
        const user_id = authUser.id
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            }
        })

        if (!user) {
            return this.internalResponse(false, {}, 400, 'Invalid user')
        }

        const update_details = {
            firstName: userDTO.first_name,
            lastName: userDTO.last_name,
            descriptions: userDTO.descriptions,
            location: userDTO.location,
            sex: userDTO.sex,
            date_of_birth: userDTO.date_of_birth
        }

        //update the details
        await this.schema(User).merge(user, update_details)

        const result = await this.updateOne(User, user)
        const { password, ...data } = result

        return this.internalResponse(true, data, 200, 'User profile updated successfully')
    }
}

export const userService = new UserServices();
