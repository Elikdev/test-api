import { DeepPartial, QueryRunner, getRepository } from "typeorm";
import { BaseService } from "../../helpers/db.helper";
import {Transactions} from './transaction.model'
import {Requests} from '../requests/request.model'
import { CreateTransactionsDto} from "./Dto/transaction.Dto";
import { jwtCred } from "../../utils/enum";
import { userService } from "../user/user.services";


class TransactionService extends BaseService {
  super: any

  public async createTransaction(createTransactionDto: CreateTransactionsDto) {
    const newTransaction = await this.create(Transactions, createTransactionDto)

    return await this.save(Transactions, newTransaction)
  }

  public async updateTransaction(
    updateTransactionDto: DeepPartial<Transactions>
  ) {
    try {
      const { id, ...updateDetails } = updateTransactionDto
      const transactionToUpdate = await this.findOne(Transactions, id)
      if (!transactionToUpdate) {
        throw new Error("Invalid transaction id")
      }
      this.schema(Transactions).merge(transactionToUpdate, updateDetails)
      return await this.updateOne(Transactions, transactionToUpdate)
    } catch (error) {
      throw error
    }
  }

  public async findOneTransaction(
    transaction_reference: string,
    transaction_id: string
  ) {
    return this.findOne(Transactions, {
      where: [{ transaction_reference }, { transaction_id }],
    })
  }

  public async getUsersTransactions(
    userId: number,
    limit: number,
    offset: number
  ) {
    const [list, count] = await getRepository(Transactions).findAndCount({
      where: { user: userId },
      order: { updated_at: "DESC" },
      skip: offset,
      take: limit,
    })

    return { list, count }
  }

  public async findTransactionById(userId: number, id: number) {
    return this.findOne(Transactions, {
      where: { user: userId, id },
    })
  }

  public async saveTransactionWithQueryRunner(
    queryRunner: QueryRunner,
    createTransactionDto: DeepPartial<Transactions>
  ) {
    const newTransaction = queryRunner.manager.create(
      Transactions,
      createTransactionDto
    )

    return await queryRunner.manager.save(newTransaction)
  }

  public async getUsersAndInfluencersTransactions(
    authUser: jwtCred,
    tDTO: { page: number; limit: number }
  ) {
    const user_id = authUser.id
    const { page, limit } = tDTO

    //find the user
    const user_exists = await userService.findUserWithId(user_id)

    let transactions: any
    let docCount: any
    let totalPages: any

    if (!user_exists) {
      return this.internalResponse(false, {}, 400, "user not found")
    }

    const offset = limit * (page - 1)

    if (
      user_exists.account_type === "fan" ||
      user_exists.account_type === "celebrity"
    ) {
      const { list, count } = await this.getUsersTransactions(
        user_exists.id,
        limit,
        offset
      )
      transactions = list
      docCount = count
      totalPages = Math.ceil(count / limit)
    } else {
      transactions = []
    }

    if (transactions?.length <= 0) {
      return this.internalResponse(
        false,
        {},
        400,
        "you don't have any transactions"
      )
    }

    return this.internalResponse(
      true,
      { transactions: transactions, totalCount: docCount, pages: totalPages },
      200,
      "transactions retrieved"
    )
  }

      public async getUsersAndInfluencersTransaction(authUser: jwtCred, tDTO: {transactionId: number}){
      const user_id = authUser.id
      const { transactionId } = tDTO

      //find the user
      const user_exists = await userService.findUserWithId(user_id)

      if(!user_exists){
          return this.internalResponse(false, {}, 400, "user not found")
      }

      const transaction = await this.findTransactionById(user_exists.id, transactionId)

      if(!transaction) {
          return this.internalResponse(false, {}, 400, "transaction not found")
      }

      return this.internalResponse(true, transaction, 200, "transaction found")
  }

  public async getAllTransactions() {
    const transactions = await getRepository(Transactions).find({
      order: {created_at: "DESC"}
    })
  }
}

export const transactionService = new TransactionService()