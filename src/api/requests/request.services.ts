import { DeepPartial } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { CreateRequestDto } from "./Dto/create-request.Dto";
import {Requests} from './request.model'



class RequestService extends BaseService{
    super:any

    public async createRequest(createRequestDto:CreateRequestDto){
        try{
            const newRequest = await this.create(Requests,createRequestDto)
            return await this.save(Requests,newRequest)
        }catch(error){
            throw error
        }
    }

    public async updateRequest(updateRequestDto:DeepPartial<Requests>){
        try{
            const {id, ...updateDetails} = updateRequestDto
            const requestToUpdate = await this.findOne(Requests, id)
            if(!requestToUpdate){
                throw new Error("Invalid transaction id")
            }
            this.schema(Requests).merge(requestToUpdate, updateDetails)
            return await this.updateOne(Requests, requestToUpdate)
        }catch(error){
            throw error
        }

    }
}

export const requestService = new RequestService()