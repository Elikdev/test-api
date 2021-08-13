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

export type innerResponse = {
    status: boolean,
    statusCode: number,
    message: string,
    data : any
}

export class BaseService {
    public  internalResponse (status: boolean = true , data : any, statusCode: number = 200 , message: string = "success") : innerResponse {
        return {
            status,
            statusCode,
            message,
            data
        }
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
    public async execQuery<T>(model: EntityTarget<T> ,query: string) {
        return await getRepository(model).query(query)
    }
}