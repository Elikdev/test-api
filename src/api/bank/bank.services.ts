import axios from "axios"
import { Bank } from "./bank.model"
import { Influencer } from "../influencer/influencer.model"
import { jwtCred } from "../../utils/enum"
import { BaseService } from "../../helpers/db.helper"
import { influencerService } from "../influencer/influencer.services"
import { getRepository } from "typeorm"

const NUBAN_API_KEY = process.env.NUBAN_API_KEY

class BankService extends BaseService {
  private async getAccountDetailsFromNuban(account_number: string) {
    try {
      const url = `https://app.nuban.com.ng/api/${NUBAN_API_KEY}?acc_no=${account_number}`

      const { data } = await axios.get(url)

      if (data.error) {
        return {
          isError: true,
          message: data?.message
            ? data.message
            : "An error occured while trying to get account details",
        }
      }

      return {
        isError: false,
        data,
      }
    } catch (error) {
      if (error.response) {
        console.log(error)
        return {
          isError: true,
          message: error.response?.data
            ? error.response.data?.message
            : "An error occured while trying to get account details",
        }
      } else if (error.request) {
        console.log(error)
        return {
          isError: true,
          message: "An error occured while trying to get account details",
        }
      } else {
        console.log(error)
        return {
          isError: true,
          message: "An error occured while trying to make the request",
        }
      }
    }
  }

  public async getUserBankwithAccountNumber(
    userId: number,
    account_number: string
  ): Promise<Bank> {
    return await this.findOne(Bank, {
      user: userId,
      account_number: account_number,
    })
  }

  public async getUserBankwithId(
    userId: number,
    bankId: number
  ): Promise<Bank> {
    return await this.findOne(Bank, { id: bankId, user: userId })
  }

  public async getUserBanks(userId: number): Promise<Bank[]> {
    return await this.schema(Bank).find({
      where: { user: userId },
    })
  }

  public async getBankAccount(
    authUser: jwtCred,
    bankDTO: { account_number: string }
  ) {
    //check if account number has been added before
    const user_id = authUser.id

    const account_number_exists = await this.getUserBankwithAccountNumber(
      user_id,
      bankDTO.account_number
    )

    if (account_number_exists) {
      return this.internalResponse(
        false,
        {},
        400,
        "This account number has been added initially"
      )
    }

    //get bank account
    const data = await this.getAccountDetailsFromNuban(bankDTO.account_number)

    if (data.isError) {
      return this.internalResponse(
        false,
        {},
        400,
        data.message
          ? data.message
          : "Error in fetching bank details. Try again later"
      )
    }

    if (data.data.length > 0) {
      const actualData = data.data[0]
      const { requests, execution_time, ...bankDetails } = actualData

      return this.internalResponse(
        true,
        bankDetails,
        200,
        "Bank details fetched successfully"
      )
    } else {
      return this.internalResponse(
        false,
        {},
        400,
        "An error occured while trying to fetch bank details"
      )
    }
  }

  public async BankDetailsInstance(
    account_name: string,
    account_number: string,
    bank_name: string,
    user: Influencer
  ) {
    const bank = new Bank()
    bank.account_name = account_name
    bank.account_number = account_number
    bank.bank_name = bank_name
    bank.user = user

    return bank
  }

  public async saveBankDetails(bank: Bank) {
    return await this.save(Bank, bank)
  }

  public async addBankDetails(
    authUser: jwtCred,
    bankDTO: { account_name: string; account_number: string; bank_name: string }
  ) {
    //get the user
    const user_id = authUser.id
    const influencer = await influencerService.findInfluencerById(user_id)

    if (influencer.account_type === "fan") {
      return this.internalResponse(
        false,
        {},
        400,
        "This function is not available for fan"
      )
    }

    const bank_exists = await this.getUserBankwithAccountNumber(
      user_id,
      bankDTO.account_number
    )

    if (bank_exists) {
      return this.internalResponse(
        false,
        {},
        400,
        "These bank details have been added initially"
      )
    }

    //add the bank details
    const { account_name, account_number, bank_name } = bankDTO
    const bank = await this.BankDetailsInstance(
      account_name.toLowerCase(),
      account_number,
      bank_name.toLowerCase(),
      influencer
    )

    const new_bank = await this.saveBankDetails(bank)

    if (!new_bank) {
      return this.internalResponse(
        false,
        {},
        400,
        "Error in adding bank details"
      )
    }

    delete new_bank.user

    return this.internalResponse(
      true,
      new_bank,
      200,
      "Bank details added successfully"
    )
  }

  public async getBank(authUser: jwtCred, bankDTO: { bankId: number }) {
    const user_id = authUser.id

    const bank = await this.getUserBankwithId(user_id, bankDTO.bankId)

    if (!bank) {
      return this.internalResponse(false, {}, 400, "Bank not found")
    }

    return this.internalResponse(true, bank, 200, "Bank details retrieved")
  }

  public async getBanks(authUser: jwtCred) {
    const user_id = authUser.id

    const banks = await this.getUserBanks(user_id)

    if (banks.length <= 0) {
      return this.internalResponse(
        false,
        {},
        400,
        "You have not added any banks"
      )
    }

    return this.internalResponse(true, banks, 200, "Banks retrieved")
  }
}

export const bankService = new BankService()
