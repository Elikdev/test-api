import { IndustriesOption } from "../../config/industries";
import { BaseService, Industry, jwtCred } from "../../enums";
import { User } from "../User/user.model";
import { Interest } from "./interest.model";

class InterestService extends BaseService {
    public getAllInterests() {
        return this.internalResponse(true, IndustriesOption)
    }

    public async addUserInterests(authuser: jwtCred, interestDTO: Industry[]) {
        const user_id = authuser.id
        let user = await this.findOne(User, {
            where: {
                id: user_id
            },
            relations: ["interest"]
        })

        // if no interest create a new one 
        if (!user.interest) {
            const interest = await this.create(Interest, {
                industries: interestDTO
            })
            user.interest = interest
            await this.schema(Interest).insert(interest)

            
        } else {
            // save interest
            const interest = await this.updateOne(Interest, {
                ...user.interest,
                industries: interestDTO
            })
            user.interest = interest
        }

        user = await this.save(User, user)

        await this.save(User, user)

        return this.internalResponse(true, { ...user.interest }, 200, "success")
    }
}


export const interestService = new InterestService()