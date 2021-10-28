import { celebrate } from "celebrate";
import Joi from "joi";

class TransactionValidation {
  public getAllValidation() {
    return celebrate({
      query: {
        limit: Joi.number().optional(),
        page: Joi.number().optional(),
      },
    });
  }

  public getOneValidation() {
    return celebrate({
      params: {
       transactionId: Joi.number().required()
      },
    });
  }
}

export const transactionValidation = new TransactionValidation();