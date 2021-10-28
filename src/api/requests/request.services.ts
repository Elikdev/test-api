import { DeepPartial, QueryRunner } from "typeorm";
import { getConnection } from "typeorm"
import { BaseService } from "../../helpers/db.helper";
import { transactionService } from "../transactions/transaction.services";
import { CreateRequestDto } from "./Dto/create-request.Dto";
import {Requests} from './request.model'
import { getRepository } from "typeorm"
import { jwtCred } from "../../utils/enum"
import { userService } from "../user/user.services"
import { influencerService } from "../influencer/influencer.services"
import { walletService } from "../wallet/wallet.services"
import { AuthModule } from "../../utils/auth"
import { Wallet } from "../wallet/wallet.model"
import { sendEmail, compileEjs } from "../../helpers/mailer.helper"
import { scheduleRequestJobChecker }from "../../helpers/cronjobs"

class RequestService extends BaseService{
    super:any

    public async createRequest(
        authUser: jwtCred, 
        requestDto: {
            purpose
            influencer: number
            fan_introduction?: string
            shoutout_message: any
            request_type: string
            request_delivery: any
        }
    ) {

        const { 
            purpose, 
            influencer: influencerId, 
            fan_introduction, 
            shoutout_message, 
            request_type, 
            request_delivery 
        } = requestDto;

        const user_id = authUser.id
        const user = await userService.getUserDetails(user_id)
        if (!user) {
            return this.internalResponse(false, {}, 200, "Invalid user")
        }

        const influencer = await influencerService.findInfluencerById(influencerId)
        if (!influencer) {
            return this.internalResponse(false, {}, 400, "Influencer does not exist or has been deleted")
        }

        // check if request is dm, check if influencer has set rate for dm
        const { rate_dm, rate_shout_out } = influencer
        if (request_type == "direct message" && (!rate_dm || rate_dm < 0 || rate_dm == null) ) {
            return this.internalResponse(false, {}, 400, "Influencer DM rate not set. Please try again later")
        }

        // do same check for shout
        if (request_type == "shout out" && (!rate_shout_out || rate_shout_out < 0 || rate_shout_out == null) ) {
            return this.internalResponse(false, {}, 400, "Influencer Shout Out rate not set. Please try again later")
        }
    
        // check the fan if he has enough money to pay for the request
        const fan_wallet = await walletService.findWalletByUserId(user_id);
        if (!fan_wallet) {
            return this.internalResponse(false, {}, 400, "Unable to fetch wallet info.")
        }
        const rate_amount = request_type == "direct message" ? rate_dm : rate_shout_out;
        const isWalletBalanceOk = parseFloat(fan_wallet.ledger_balance) > parseFloat(`${rate_amount}`)
        if (!isWalletBalanceOk) {
            return this.internalResponse(false, {}, 400, "Not enough funds in your wallet to process this request")
        }
        
        // start transactions
        const connection = getConnection()
        const queryRunner = connection.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()
        try {
            // create a new transaction for user
            const transac = await transactionService.saveTransactionWithQueryRunner(queryRunner, {
                user,
                description: request_type + "Request",
                amount: parseFloat(`${rate_amount}`),
                transaction_reference: AuthModule.generateRefCode(),
                transaction_id: AuthModule.generateRefCode(),
                status: "pending",
            })

            // update both fan and influencer ledger balance
            const fan_tran_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: authUser }],
            })
            const inflencer_tran_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: influencer }],
            })
            const new_fan_ledger_balance = 
                parseFloat(fan_tran_wallet.ledger_balance) - rate_amount
            const new_influencer_ledger_balance = 
                parseFloat(inflencer_tran_wallet.ledger_balance) + rate_amount
            await queryRunner.manager.update(
                Wallet,
                fan_tran_wallet.id,
                { ledger_balance: new_fan_ledger_balance.toFixed(2) }
            )
            await queryRunner.manager.update(
                Wallet,
                inflencer_tran_wallet.id,
                { ledger_balance: new_influencer_ledger_balance.toFixed(2) }
            )

            // create a new request entry
            const reques = await this.saveRequestWithQueryRunner(queryRunner, {
                fan: user,
                influencer,
                request_type,
                request_delivery,
                purpose,
                fan_introduction,
                shoutout_message,
                status: "pending",
                transaction: transac
            })

            // set time to 72 hours from now, using 5 mins for testing
            // 72 = 259200000 plus 1 hour cos server time is 1 hr behind
            const in72hours = new Date(Date.now() + 3900000);
            console.log(in72hours, 'ttt')
            
            // send mail notification to influencer/, text will be changed
            const message = compileEjs({ template: "update-template" })({
                body: `A user just made a request for ${request_type} which expires in 72 hours🚀.
                `,
                name: `${Array.isArray(influencer.full_name.split(" ")) ? influencer.full_name.split(" ")[0] : influencer.full_name}`,
            });
            const sent_mail = await sendEmail({
                html: message,
                subject: "Bamiki Fan Request",
                to: influencer.email.toLowerCase(),
            });
              
            if(!sent_mail) {
                await queryRunner.rollbackTransaction()
                await queryRunner.release()
                return this.internalResponse(true, {}, 400, "Request not successful")
            }
            await queryRunner.commitTransaction()

            // run cron job to check if the request has been responded to after expiry time
            const cronFunParam = async () => {
                console.log("iiiii")
                const cronFunctionRequest = await this.findRequestWithId(reques.id);
                if (cronFunctionRequest.status === "pending") {
                    // return money back to fan and remove from influencer
                    const x = rate_amount;

                    getRepository(Wallet)
                        .createQueryBuilder('wallet')
                        .update(Wallet)
                        .whereInIds(fan_wallet.id)
                        .set({ ledger_balance: () => {
                            const dt = `${parseFloat('ledger_balance') + x}`
                            // return 'ledger_balance + :x' 
                            return dt
                        }})
                        .setParameter("x", x)
                        .execute();
    
                    getRepository(Wallet)
                        .createQueryBuilder('wallet')
                        .update(Wallet)
                        .whereInIds(inflencer_tran_wallet.id)
                        .set({ ledger_balance: () => {
                            const dt = `${parseFloat('ledger_balance') - x}`
                            // return 'ledger_balance - :x' 
                            return dt
                        }})
                        .setParameter("x", x)
                        .execute();
    
                }
            }
            scheduleRequestJobChecker(in72hours, cronFunParam)

            return this.internalResponse(true, { request: reques }, 200, "Request created")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {},
              400,
              "Request not successful. Please try again"
            )
        }
                
    }

    // cancel the request by fan

    // accept the request by influencer

    // reject the  request by influencer

    public async updateRequest(updateRequestDto:DeepPartial<Requests>){
        try{
            const {id, ...updateDetails} = updateRequestDto
            const requestToUpdate = await this.findOne(Requests, id)
            if(!requestToUpdate){
                throw new Error("Invalid request id")
            }
            this.schema(Requests).merge(requestToUpdate, updateDetails)
            return await this.updateOne(Requests, requestToUpdate)
        }catch(error){
            throw error
        }

    }

    public async respondToRequest(respondRequestDto:DeepPartial<Requests>){
            const {id,influencer} = respondRequestDto
            const requestInfluencer = await getRepository(Requests).findOne({
                where: [
                    {
                        id
                    }
                ],
                relations: ["influencer"]
            })
             if(influencer !== requestInfluencer.influencer.id){
                 throw new Error("this request does not belong to this influencer")
             }
             return await this.updateRequest(respondRequestDto)
    }

    public async saveRequestWithQueryRunner(queryRunner: QueryRunner, createRequestDto): Promise<Requests>{
        const newRequest =  queryRunner.manager.create(Requests, createRequestDto);

        return await queryRunner.manager.save(newRequest)
    }

    public async findRequestWithId(id: number): Promise<Requests> {
        return await this.findOne(Requests, {
            where: {
                id,
            },
        })
    }
}

export const requestService = new RequestService()