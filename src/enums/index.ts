import {EntityTarget, getRepository} from "typeorm";

export enum Gender {
    MALE = "male",
    FEMALE = "female",
    UNKNOWN = "none"
}

export enum AccountStatus {
    DISABLED = "disabled",
    ACTIVE = "active",
    PENDING = "pending"
}

export enum AccountType {
    FAN = "fan",
    ADMIN = "admin",
    CELEB = "celebrity"
}

export type innerResponse = {
    status: boolean,
    statusCode: number,
    message: string,
    data : any
}

export interface jwtCred  {
    username: string
    email: string 
    first_name: string 
    last_name: string
}




export class BaseService {
    public  internalResponse (status = true , data : any, statusCode = 200 , message = "success") : innerResponse {
        return {
            status,
            statusCode,
            message,
            data
        }
    }

    public async save<T, B> (model: EntityTarget<T>, params: T): Promise<T> {
        return await getRepository(model).save(params)
    }

    public async findOne<T, B> (model:EntityTarget<T>, params: B ): Promise<T> {
        return await getRepository(model).findOne(
            params
        )
    }

    public async getOne<T>(model: EntityTarget<T>, id:number): Promise<T> {
        return await getRepository(model).findOne({
            where :{
                id
            }
        })
    }
    public async getMany<T, B>(model:EntityTarget<T>, params: B ): Promise<T[]> {
        return await getRepository(model).find(
            params
        )
    }
    public async deleteOne<T, B>(model:EntityTarget<T>, params:B ) : Promise<boolean | Error> {
        const t = await getRepository(model).delete(params)
        return !!t.affected
    }
    public async updateOne<T, B>(model:EntityTarget<T>, id:number, params:B ):Promise<T>{
        return await getRepository(model).save(
            params,
        )
    }
    public async execQuery<T>(model: EntityTarget<T> ,query: string):Promise<T> {
        return await getRepository(model).query(query)
    }
}