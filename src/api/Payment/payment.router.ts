import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { paymentDetailsController } from "./payment.controller";
import TransactionController from "../Transactions/transaction.controller";

const Route = Router();


Route.post('/new_payment',AuthModule.isAuthenticatedUser,celebrate({
        body: Joi.object({
            wallet: Joi.number().required(),
            narration: Joi.string().required(),
            reference:Joi.string().required()
        }),
    }),TransactionController.saveTransactions)

export default Route;
