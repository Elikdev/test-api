import { Entity, EntityTarget, getRepository, Repository, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,} from "typeorm";
import { innerResponse } from "../utils/enum";

export class BaseService {
    public internalResponse(status = true, data: any, statusCode = 200, message = "success"): innerResponse {
        return {
            status,
            statusCode,
            message,
            data
        }
    }

    public schema<T>(model: EntityTarget<T>): Repository<T> {
        return getRepository(model)
    }

    public async save<T, B>(model: EntityTarget<T>, params: T): Promise<T> {
        return await this.schema(model).save(params)
    }

    public async findOne<T, B>(model: EntityTarget<T>, params: B): Promise<T> {
        return await this.schema(model).findOne(
            params
        )
    }

    public async getOne<T>(model: EntityTarget<T>, id: number): Promise<T> {
        return await this.schema(model).findOne({
            where: {
                id
            }
        })
    }
    public async getMany<T, B>(model: EntityTarget<T>, params: B): Promise<T[]> {
        return await this.schema(model).find(
            params
        )
    }
    public async deleteOne<T, B>(model: EntityTarget<T>, params: B): Promise<boolean | Error> {
        const t = await this.schema(model).delete(params)
        return !!t.affected
    }
    public async updateOne<T, B>(model: EntityTarget<T>, params: B): Promise<T> {
        return await this.schema(model).save(
            params,
        )
    }

    public async create<T, B>(model: EntityTarget<T>, params: B): Promise<T> {
        return await this.schema(model).create(
            params,
        )
    }

    public async execQuery<T>(model: EntityTarget<T>, query: string): Promise<T> {
        return await this.schema(model).query(query)
    }
}


@Entity()
export abstract class BaseModel{
    
    @PrimaryGeneratedColumn()
    id:number

     @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    updated_at:Date

}