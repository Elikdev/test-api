import { celebrate } from "celebrate";
import Joi from "joi";

class WalletValidation {
  public fundWalletValidation() {
    return celebrate({
      body: {
        amount: Joi.string()
          .pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
          .required()
          .messages({
            "string.pattern.base": `Amount field can only be in format ${`120`} or ${`120.00`}`,
          }),
        transaction_status: Joi.string().required(),
        transaction_reference: Joi.string().required(),
        transaction_id: Joi.string().required(),
        currency: Joi.string().required(),
      },
    });
  }
}

export const walletValidation = new WalletValidation();
