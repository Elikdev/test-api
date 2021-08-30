import { Request, Response } from "express";
import { errorResponse, successRes } from "../../utils/response";
import { Payment_detail } from "./payment.model";
import { paymentDetailsService } from "./payment.service";

class PaymentDetailsController {
 async getPaymentDetails(req: Request, res: Response) {
  try {
   const authuser = (req as any).user;
   const response = await paymentDetailsService.getUserPaymentDetails(authuser);
   return successRes(res, response.data, response.message);
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500);
  }
 }

 async addPaymentDetails(req: Request, res: Response) {
  try {
   const authuser = (req as any).user;
   const paymentDetailsDTO = req.body;
   const response = await paymentDetailsService.addPaymentDetails(
    authuser,
    paymentDetailsDTO
   );

   if (!response.status) {
    return errorResponse(res, response.message, response.statusCode);
   }

   return successRes(res, response.data, response.message);
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500);
  }
 }
}

export const paymentDetailsController = new PaymentDetailsController();
