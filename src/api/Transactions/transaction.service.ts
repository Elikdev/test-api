import { getRepository } from "typeorm";
import { BaseService, jwtCred} from "../../enums";
import Paystack from "../../utils/paystack";
import {Transactions} from './transaction.model'
import {User} from  '../User/user.model'
import {DebitDetails, TransactionStatus, TransactionType} from '../../enums'
import { ActivitiesRequest } from "../User/activityRequest.model";
import { Wallet } from "../Wallet/wallet.model";


class TransactionService extends BaseService {
    super;
    public async verifyTransaction(reference:string){
        try{
            const response:any = await Paystack.verifyPayment(reference)
            return response.data
        }catch(error){
            throw error
        }
    }
    
    public async creditTransaction(transactionDto:{
        user: User,
        amount: number,
        reference: string,
        status: TransactionStatus,
        narration?:string,
        type: TransactionType,
        request?:ActivitiesRequest,
        wallet?:Wallet
        meta:any,
        credited_by:number,
        debited_to:any
    }){
        try{
            const transaction = await this.create(Transactions, transactionDto)
            await this.save(Transactions, transaction)
        }catch(error){
            throw error
        }

    }
}

export const transactionService = new TransactionService()