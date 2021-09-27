import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import {Transactions} from './transaction.model'
import {transactionService} from './transaction.service'


class TransactionController{
    static async createNewPayment(req:Request, res:Response){
        const {narration, reference, wallet} = req.body
        const authUser = (req as any).user;
         try{
             const transactionDetails = await transactionService.verifyTransaction(reference)
             const {amount,status, type="credit", ...meta} = transactionDetails.data
             await transactionService.creditTransaction({user:authUser,amount,status,type, reference, narration, meta, credited_by:authUser.id , debited_to:{}, wallet})
             successRes(res,{})
         }catch(error){
             console.log(error)
             errorResponse(res, error.message)
         }
    }
}

export default TransactionController