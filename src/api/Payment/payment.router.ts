import { celebrate } from "celebrate";
import { Router } from "express";
import Joi from "joi";
import { AuthModule } from "../../utils/auth";
import { paymentDetailsController } from "./payment.controller";

const Route = Router();

export default Route;
