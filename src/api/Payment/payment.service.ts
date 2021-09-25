import { getRepository } from "typeorm";
import { BaseService, jwtCred, Bank, PaymentInterval } from "../../enums";
import { BanksOption } from "../../config/banks";
import { User } from "../User/user.model";
import { Payment_detail } from "./payment.model";
import { ActivitiesPricing } from "./activitesPricing.model"

class PaymentDetailsServices extends BaseService {
    public async getUserPaymentDetails(authuser: jwtCred) {
        const user_id = authuser.id

        const user_payment_details = await this.findOne(Payment_detail, {
            where: {
                user: user_id,
            },
        })

        if (!user_payment_details) {
            return this.internalResponse(false, {}, 400, "No payment details")
        }

        const bank_details = BanksOption.find(
            (bank) => bank.code === user_payment_details.bankCode
        )

        const payment_details = {
            id: user_payment_details.id,
            account_name: user_payment_details.accountName,
            account_number: user_payment_details.accountNumber,
            bank_code: user_payment_details.bankCode,
            bank_name: bank_details.name,
            frequency: user_payment_details.frequency,
            interval: user_payment_details.interval,
            frequency_amount: user_payment_details.frequencyAmount,
        }

        return this.internalResponse(
            true,
            payment_details,
            200,
            "Payment details retrieved"
        )
    }

    public async addPaymentDetails(
        authuser: jwtCred,
        paymentDetailsDTO: {
            account_name: string
            account_number: string
            bank_code: string
            frequency: number
            interval: PaymentInterval
            frequency_amount: string
        }
    ) {
        const user_id = authuser.id
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
            relations: ["payment_details"],
        })

        //if payment details has been added
        if (user.payment_details) {
            const payment_detail = await this.findOne(Payment_detail, {
                where: {
                    user: user_id,
                },
            })

            const update_details = {
                accountName: paymentDetailsDTO.account_name,
                accountNumber: paymentDetailsDTO.account_number,
                bankCode: paymentDetailsDTO.bank_code,
                frequency: paymentDetailsDTO.frequency,
                interval: paymentDetailsDTO.interval,
                frequencyAmount: paymentDetailsDTO.frequency_amount,
            }

            this.schema(Payment_detail).merge(payment_detail, update_details)

            const result = await this.updateOne(Payment_detail, payment_detail)

            //check if the bank code is valid among the list of bank
            const bank_details = await BanksOption.find(
                (bank) => bank.code === payment_detail.bankCode
            )

            return this.internalResponse(
                true,
                { ...result, bank_name: bank_details.name },
                200,
                "Payment details updated"
            )
        }

        //check if the bank code is valid among the list of bank
        const bank_details = await BanksOption.find(
            (bank) => bank.code === paymentDetailsDTO.bank_code
        )

        if (!bank_details) {
            return this.internalResponse(false, {}, 400, "Invalid bank code")
        }

        const payment_details = getRepository(Payment_detail).create({
            accountName: paymentDetailsDTO.account_name,
            accountNumber: paymentDetailsDTO.account_number,
            bankCode: paymentDetailsDTO.bank_code,
            frequency: paymentDetailsDTO.frequency,
            interval: paymentDetailsDTO.interval,
            frequencyAmount: paymentDetailsDTO.frequency_amount,
        })

        payment_details.user = user

        const result = await this.save(Payment_detail, payment_details)

        delete result.user

        const newData = JSON.stringify({
            ...result,
            bankName: bank_details.name,
        })
        const parsed = JSON.parse(newData)

        return this.internalResponse(
            true,
            parsed,
            200,
            "Payment details saved successfully"
        )
    }

    //add new activity pricing
    public async setActivityPricing(
        authUser: jwtCred,
        activityDTO: { message: string; video: string; picture: string }
    ) {
        const user_id = authUser.id
        const user = await this.findOne(User, {
            where: {
                id: user_id,
            },
        })

        if (user.account_type !== "celebrity") {
            return this.internalResponse(
                false,
                {},
                400,
                "Unauthorised, Access denied"
            )
        }

        //if no data at all
        if (
            !activityDTO.message &&
            !activityDTO.picture &&
            !activityDTO.video
        ) {
            return this.internalResponse(false, {}, 400, "No data to update")
        }

        const user_pricing = await this.findOne(ActivitiesPricing, {
            where: {
                user: user_id,
            },
        })

        if (user_pricing) {
            //update the table
            const update_data = {
                message: activityDTO?.message,
                video: activityDTO?.video,
                picture: activityDTO?.picture,
            }

            //update the details
            await this.schema(ActivitiesPricing).merge(
                user_pricing,
                update_data
            )

            const result = await this.updateOne(ActivitiesPricing, user_pricing)

            return this.internalResponse(
                true,
                result,
                200,
                "Price set successfully"
            )
        }

        const newActivitiesPricing = await getRepository(
            ActivitiesPricing
        ).create({
            message: activityDTO?.message,
            video: activityDTO?.video,
            picture: activityDTO?.picture,
        })

        newActivitiesPricing.user = user

        const result = await this.save(ActivitiesPricing, newActivitiesPricing)
        delete result.user

        return this.internalResponse(
            true,
            result,
            200,
            "Price set successfully"
        )
    }

    public async getActivityPricing(authuser: jwtCred) {
        const user_id = authuser.id

        const user = await getRepository(User).findOne({
            where: { id: user_id },
        })

        if (user.account_type !== "celebrity") {
            return this.internalResponse(
                false,
                {},
                400,
                "Unauthorised, Access denied"
            )
        }

        const activitesPricing = await getRepository(ActivitiesPricing).findOne(
            {
                where: { user: user_id },
            }
        )

        if (!activitesPricing) {
            return this.internalResponse(
                false,
                {},
                400,
                "Activities prices have not been set"
            )
        }

        return this.internalResponse(
            true,
            activitesPricing,
            200,
            "Activities prices retrieved"
        )
    }
}

export const paymentDetailsService = new PaymentDetailsServices();
