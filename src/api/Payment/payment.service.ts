import { getRepository } from "typeorm";
import { BaseService, jwtCred, Bank } from "../../enums";
import { BanksOption } from "../../config/banks";
import { User } from "../User/user.model";
import { Payment_detail } from "./payment.model";

class PaymentDetailsServices extends BaseService {
 public async getUserPaymentDetails(authuser: jwtCred) {
  const user_id = authuser.id;
  const user = await this.findOne(User, {
   where: {
    id: user_id,
   },
   relations: ["payment_details"],
  });
  if (user) return this.internalResponse(true, user.payment_details);
 }

 public async addPaymentDetails(
  authuser: jwtCred,
  paymentDetailsDTO: {
   account_name: string;
   account_number: string;
   bank_code: string;
   frequency: string;
   frequency_amount: string;
  }
 ) {
  const user_id = authuser.id;
  let user = await this.findOne(User, {
   where: {
    id: user_id,
   },
   relations: ["payment_details"],
  });

  //if payment details has been added
  if (user.payment_details) {
   return this.internalResponse(
    false,
    {},
    400,
    "You have initially added a payment details"
   );
  }

  //check if the bank code is valid among the list of bank
  const bank_details = await BanksOption.find(
   (bank) => bank.code === paymentDetailsDTO.bank_code
  );

  if (!bank_details) {
   return this.internalResponse(false, {}, 400, "Invalid bank code");
  }

  const payment_details = getRepository(Payment_detail).create({
   accountName: paymentDetailsDTO.account_name,
   accountNumber: paymentDetailsDTO.account_number,
   bankCode: paymentDetailsDTO.bank_code,
   frequency: paymentDetailsDTO.frequency,
   frequencyAmount: paymentDetailsDTO.frequency_amount,
  });

  const result = await this.save(Payment_detail, payment_details);

  user.payment_details = payment_details;

  user = await this.save(User, user);

  await this.save(User, user);

  return this.internalResponse(
   true,
   { ...user.payment_details, bankName: bank_details.name },
   200,
   "Payment details saved successfully"
  );
 }
}

export const paymentDetailsService = new PaymentDetailsServices();
