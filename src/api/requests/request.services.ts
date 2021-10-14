import { DeepPartial } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import { transactionService } from "../transactions/transaction.services";
import { CreateRequestDto } from "./Dto/create-request.Dto";
import {Requests} from './request.model'
import { getRepository } from "typeorm"



class RequestService extends BaseService{
    super:any

    public async createRequest(createRequestDto:CreateRequestDto){
        try{
            const transaction = await transactionService.createTransaction({
                user:createRequestDto.fan,
                description:"test",
                amount:500,
                transaction_reference:"testing",
                transaction_id:1,
                status:"pending"
            })
            const newRequest = await this.create(Requests,{...createRequestDto, transaction:transaction.id})
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
                throw new Error("Invalid request id")
            }
            this.schema(Requests).merge(requestToUpdate, updateDetails)
            return await this.updateOne(Requests, requestToUpdate)
        }catch(error){
            throw error
        }

    }

    public async respondToRequest(respondRequestDto:DeepPartial<Requests>){
            const {id,influencer} = respondRequestDto
            const requestInfluencer = await getRepository(Requests).findOne({
                where: [
                    {
                        id
                    }
                ],
                relations: ["influencer"]
            })
             if(influencer !== requestInfluencer.influencer.id){
                 throw new Error("this request does not belong to this influencer")
             }
             return await this.updateRequest(respondRequestDto)
    }
}

export const requestService = new RequestService()