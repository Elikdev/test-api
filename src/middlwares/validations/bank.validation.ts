import { celebrate } from "celebrate"
import Joi from "joi"

class BankValidation {
  public getBankAccountValidation() {
    return celebrate({
      body: {
        account_number: Joi.string().min(10).required(),
      },
    })
  }

  public addBankDetailsValidation() {
    return celebrate({
      body: {
        account_number: Joi.string().min(10).required(),
        bank_name: Joi.string().required(),
        account_name: Joi.string().required(),
        bank_code: Joi.string().required()
      },
    })
  }

  public getBankDetailsValidation() {
    return celebrate({
      params: {
        bankId: Joi.number().required(),
      },
    })
  }
}

export const bankValidation = new BankValidation()
