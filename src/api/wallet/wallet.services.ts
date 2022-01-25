import { getConnection, getRepository } from "typeorm"
import { BaseService } from "../../helpers/db.helper"
import { DeepPartial } from "typeorm"
import { Wallet } from "./wallet.model"
import { Influencer } from "../influencer/influencer.model"
import { User } from "../user/user.model"
import { jwtCred } from "../../utils/enum"
import { userService } from "../user/user.services"
import { transactionService } from "../transactions/transaction.services"
import { verifyPaymentFromFlutterWave } from "../../helpers/flutterwave"

class WalletService extends BaseService {
  super: any

  public newWalletInstance(user: User) {
    const user_wallet = new Wallet()
    user_wallet.wallet_balance = "0.00"
    user_wallet.ledger_balance = "0.00"
    user_wallet.user = user
    return user_wallet
  }

  public async saveWallet(wallet: Wallet) {
    return await this.save(Wallet, wallet)
  }

  public async findWalletByUserId(id: number) {
    return await this.findOne(Wallet, {
      where: { user: id },
    })
  }

  public async updateWallet(
    walletToUpdate: Wallet,
    updateFields: DeepPartial<Wallet>
  ) {
    this.schema(Wallet).merge(walletToUpdate, updateFields)
    return await this.updateOne(Wallet, walletToUpdate)
  }

  public async fundFanWallet(
    authUser: jwtCred,
    userDTO: {
      amount: any
      transaction_status: string
      transaction_reference: string
      transaction_id: string
      currency: string
    }
  ) {
    const user_id = authUser.id

    const user = await userService.getUserDetails(user_id)

    if (!user) {
      return this.internalResponse(false, {}, 200, "Invalid user")
    }

    let {
      amount,
      transaction_reference,
      transaction_id,
      transaction_status,
      currency,
    } = userDTO

    //set amount to float
    amount = parseFloat(amount)

    //set transaction_status to lowercase
    transaction_status = transaction_status.toLowerCase()

    if (amount <= 0.0) {
      return this.internalResponse(
        false,
        {},
        400,
        "Amount must be greater than zero"
      )
    }

    // check if transaction is successful from clientside
    if (!["successful", "success"].includes(transaction_status)) {
      return this.internalResponse(
        false,
        {},
        400,
        "Payment failed. Please try again"
      )
    }

    // check if transaction has been made Already
    const transaction_exists = await transactionService.findOneTransaction(
      transaction_reference,
      transaction_id
    )
    if (transaction_exists) {
      return this.internalResponse(false, {}, 400, "Invalid transaction")
    }

    // verify payment from flutterwave and check status, amount, reference, currency and id
    const { data_received, error, error_data } =
      await verifyPaymentFromFlutterWave(
        `transactions/${transaction_id}/verify`
      )
    // catch flutter error
    if (error) {
      const { message: error_data_msg } = error_data
      return this.internalResponse(
        false,
        {},
        400,
        error_data_msg
          ? error_data_msg
          : "Error in verifying payment. Try again later"
      )
    }

    const {
      status: data_received_status,
      message: data_received_msg,
      data: data_received_data,
    } = data_received
    if (
      data_received_status === "success" &&
      data_received_msg === "Transaction fetched successfully"
    ) {
      // important checks upon verifyind oayment to avoid fraud
      if (
        data_received_data.tx_ref != transaction_reference ||
        data_received_data.status != "successful" ||
        data_received_data.currency != currency 
        || amount !== parseFloat(data_received_data.charged_amount) - parseFloat(data_received_data.app_fee) 
      ) {
        return this.internalResponse(
          false,
          {},
          400,
          "Transaction details not valid"
        )
      } else {
        // start ACID transaction
        const connection = getConnection()
        const queryRunner = connection.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()
        try {
          // create a new transaction for user
          await transactionService.saveTransactionWithQueryRunner(queryRunner, {
            user,
            description: "Wallet Top-Up",
            amount,
            transaction_reference,
            transaction_id,
            status: "success",
          })

          // update the wallet of the user
          const user_wallet = await queryRunner.manager.findOne(Wallet, {
            where: [{ user: authUser }],
          })
          const new_wallet_balance =
            parseFloat(user_wallet.wallet_balance) + amount
          const new_ledger_balance =
            parseFloat(user_wallet.ledger_balance) + amount
          const update_details = {
            wallet_balance: new_wallet_balance.toFixed(2),
            ledger_balance: new_ledger_balance.toFixed(2),
          }
          await queryRunner.manager.update(
            Wallet,
            user_wallet.id,
            update_details
          )
          await queryRunner.commitTransaction()
          return this.internalResponse(
            true,
            { data_received_data },
            200,
            "Payment successful"
          )
        } catch (error) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return this.internalResponse(
            false,
            {},
            400,
            "Payment not successful. Please try again"
          )
        }
      }
    } else {
      return this.internalResponse(
        false,
        {},
        400,
        data_received_msg
          ? data_received_msg
          : "Error in verifying payment. Try again later"
      )
    }
  }

  public async getWalletForUser(authUser: jwtCred) {
    const user_id = authUser.id

    const user_wallet  = await this.findWalletByUserId(user_id)


    if(!user_wallet) {
      return this.internalResponse(false, {}, 400, "Wallet not found")
    }

    return this.internalResponse(true, user_wallet, 200, "Wallet retrieved successfully!")
  }

  public async allEarnings() {
    const all_wallets = await getRepository(Wallet).find({})

    let earnings: any;

    if (all_wallets.length <= 0) {
      return 0.0
    } else {
      const actual_wallets = all_wallets.filter((wallt) =>  wallt.wallet_balance !== null)
       earnings = actual_wallets.reduce((acc, wallt) => {
        return acc + parseFloat(wallt?.wallet_balance)
      }, 0)

      return earnings
    }
  }
}

export const walletService = new WalletService()
