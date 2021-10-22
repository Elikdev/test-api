import { DeepPartial, QueryRunner } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import {Transactions} from './transaction.model'
import {Requests} from '../requests/request.model'
import { CreateTransactionsDto} from "./Dto/transaction.Dto";


class TransactionService extends BaseService{
    super:any

    public async createTransaction(createTransactionDto:CreateTransactionsDto){
       const newTransaction =  await this.create(Transactions,createTransactionDto)

       return await this.save(Transactions, newTransaction)
    }

    public async updateTransaction(updateTransactionDto:DeepPartial<Transactions>){
        try{
            const {id, ...updateDetails} = updateTransactionDto
        const transactionToUpdate = await this.findOne(Transactions,id)
        if(!transactionToUpdate){
            throw new Error("Invalid transaction id")
        }
        this.schema(Transactions).merge(transactionToUpdate,updateDetails)
        return await this.updateOne(Transactions, transactionToUpdate)
        }catch(error){
            throw error
        }
    }

    public async findOneTransaction(transaction_reference: string, transaction_id: string) {
        return this.findOne(Transactions, {
            where : [
                { transaction_reference },
                { transaction_id },
            ]
        })
    }

    public async saveTransactionWithQueryRunner(queryRunner: QueryRunner, createTransactionDto: DeepPartial<Transactions>){
        const newTransaction =  queryRunner.manager.create(Transactions, createTransactionDto);

        return await queryRunner.manager.save(newTransaction)
    }
}

export const transactionService = new TransactionService()