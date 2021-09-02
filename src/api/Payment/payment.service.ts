import { getRepository } from "typeorm";
import { BaseService, jwtCred, Bank, PaymentInterval } from "../../enums";
import { BanksOption } from "../../config/banks";
import { User } from "../User/user.model";
import { Payment_detail } from "./payment.model";

class PaymentDetailsServices extends BaseService {
    public async getUserPaymentDetails(authuser: jwtCred) {
        const user_id = authuser.id;

        const user_payment_details = await this.findOne(Payment_detail, {
            where: {
                user: user_id,
            },
        });

        if (!user_payment_details) {
            return this.internalResponse(false, {}, 400, "No payment details");
        }

        const bank_details = BanksOption.find(
            (bank) => bank.code === user_payment_details.bankCode
        );

        const payment_details = {
               id: user_payment_details.id,
               account_name: user_payment_details.accountName,
               account_number: user_payment_details.accountNumber,
               bank_code: user_payment_details.bankCode,
               bank_name: bank_details.name,
               frequency: user_payment_details.frequency,
               interval: user_payment_details.interval,
               frequency_amount: user_payment_details.frequencyAmount,
        };

        return this.internalResponse(
            true,
            payment_details,
            200,
            "Payment details retrieved"
        );
    }

    public async addPaymentDetails(
        authuser: jwtCred,
        paymentDetailsDTO: {
            account_name: string;
            account_number: string;
            bank_code: string;
            frequency: number;
            interval: PaymentInterval;
            frequency_amount: string;
        }
    ) {
        const user_id = authuser.id;
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["payment_details"],
        });

        //if payment details has been added
        if (user.payment_details) {
            const payment_detail = await this.findOne(Payment_detail, {
                where: {
                    user: user_id,
                },
            });

            const update_details = {
                   accountName: paymentDetailsDTO.account_name,
                   accountNumber: paymentDetailsDTO.account_number,
                   bankCode: paymentDetailsDTO.bank_code,
                   frequency: paymentDetailsDTO.frequency,
                   interval: paymentDetailsDTO.interval,
                   frequencyAmount: paymentDetailsDTO.frequency_amount,
            };

            const updated_data = this.schema(Payment_detail).merge(
                payment_detail,
                update_details
            );

            //check if the bank code is valid among the list of bank
            const bank_details = await BanksOption.find(
                (bank) => bank.code === payment_detail.bankCode
            );

            return this.internalResponse(
                true,
                { ...updated_data, bank_name: bank_details.name },
                200,
                "Payment details updated"
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
            interval: paymentDetailsDTO.interval,
            frequencyAmount: paymentDetailsDTO.frequency_amount,
        });

        payment_details.user = user;

        const result = await this.save(Payment_detail, payment_details);

        delete result.user;

        const newData = JSON.stringify({
            ...result,
            bankName: bank_details.name,
        });
        const parsed = JSON.parse(newData);

        return this.internalResponse(
            true,
            parsed,
            200,
            "Payment details saved successfully"
        );
    }
}

export const paymentDetailsService = new PaymentDetailsServices();
