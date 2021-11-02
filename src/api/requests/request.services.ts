import { DeepPartial, QueryRunner } from "typeorm";
import { getConnection } from "typeorm"
import { BaseService } from "../../helpers/db.helper";
import { transactionService } from "../transactions/transaction.services";
import { CreateRequestDto } from "./Dto/create-request.Dto";
import {Requests} from './request.model'
import { getRepository } from "typeorm"
import { jwtCred, RequestStatus } from "../../utils/enum"
import { userService } from "../user/user.services"
import { influencerService } from "../influencer/influencer.services"
import { walletService } from "../wallet/wallet.services"
import { AuthModule } from "../../utils/auth"
import { Wallet } from "../wallet/wallet.model"
import { sendEmail, compileEjs } from "../../helpers/mailer.helper"
import { scheduleRequestJobChecker }from "../../helpers/cronjobs"
import { roomService } from "../room/room.service"

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
                description: request_type + " Request",
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
                transaction: transac,
                rate: `${rate_amount}`
            })

            // set time to 72 hours from now 
            // 72 = 259200000 plus 1 hour cos server time is 1 hr behind
            const in72hours = new Date(Date.now() + 262800000);
            
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
                const cronFunctionRequest = await this.findRequestWithId(reques.id);
                if (cronFunctionRequest.status === "pending") {
                    // return money back to fan and remove from influencer
                    const x = rate_amount;
                    const fan_cron_wallet = await walletService.findWalletByUserId(user_id)
                    const influencer_cron_wallet = await walletService.findWalletByUserId(influencerId)

                    await getConnection()
                        .createQueryBuilder()
                        .update(Wallet)
                        .set({ 
                            ledger_balance: `${parseFloat(fan_cron_wallet.ledger_balance) + x}`,
                        })
                        .where("id = :id", { id: fan_wallet.id })
                        .execute();

                    await getConnection()
                        .createQueryBuilder()
                        .update(Wallet)
                        .set({ 
                            ledger_balance: `${parseFloat(influencer_cron_wallet.ledger_balance) - x}`,
                        })
                        .where("id = :id", { id: inflencer_tran_wallet.id })
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

    public async getRequests(userId: number) {
        const [user_requests, count] = await getRepository(Requests).findAndCount({
            where: [
                { fan: userId },
                { influencer: userId }
            ],
            relations: ["influencer", "fan"],
            order: { created_at: "DESC" },
        })

        for (const request of user_requests) {
            delete request.influencer.password
            delete request.influencer?.email_verification
            delete request.fan.password
            delete request.fan?.email_verification
        }
    
        return { user_requests, count }
    }

    // get all my requests
    public async getAllRequestForAUser(user_id: number) {
        const user_exists = await userService.findUserWithId(user_id)
        if (!user_exists) {
          return this.internalResponse(false, {}, 400, "user not found")
        }
    
        const { user_requests, count } = await this.getRequests(user_id);
        if (user_requests.length <= 0) {
          return this.internalResponse(
            false,
            { total: 0, requests: [] },
            400,
            "No requests available yet"
          )
        }
    
        return this.internalResponse(
          true,
          { total: count, requests: user_requests },
          200,
          "Requests retrieved"
        )
    }

    public async updateRequest(
        requestToUpdate: Requests,
        updateFields: DeepPartial<Requests>,
    ): Promise<Requests>   {
        this.schema(Requests).merge(requestToUpdate, updateFields)
        return await this.updateOne(Requests, requestToUpdate)
    }

            // NB: all notifications might not be mail but notifications boma would create
        // cancel the request
        // check if canceled already
        // check how fb handles canceling of friend request  sent and linked in handles canceling connection requests
        // check if i am actually the one that made request
        // check if the request has already beenaccepted , if yes send error message
        // check if the reuest has expired using created_aUser can not rate selft if yes, send error message or do nth
        // if it has not accepted, cancel cron job and update users wallets , delete or update the request as canceled
        // update the transaction or deleete it, remove from the influencerrequests array and fanrequests array
        // cancel the cron job that will run to check the request

        // accept the request
        // cehck if tas already been accepted
        // check if the reuest esists and  is for me,
        // check if it has not expired,
        // start transactions: update wallet update the request, update the transaction
        // cancel cron job
        // send mail notification to fan
        // commit transaction

        // reject the  request
        // check if rejected already and send error
        // check how fb handles reject of friend request and linked in handles sending connection requests
        // state reason, etc.. cancel cron job and update wallet request and transcation

    // accept or decline the request by influencer
    public async respondToRequest(
        authUser: jwtCred, 
        responseDTO: {
            requestId
            type
            reason
    }) {
        const user_id = authUser.id;

        const user_exists = await influencerService.findInfluencerById(user_id)
        if (!user_exists) {
          return this.internalResponse(false, {}, 400, "user not found")
        }

        const { requestId, type, reason } = responseDTO

        const request = await this.findRequestWithId(requestId)
        if (!request) {
            return this.internalResponse(false, {}, 400, "Request doesn't exist")
        }

        if (request.status === RequestStatus.CANCELLED) {
            return this.internalResponse(false, {}, 400, "Request cancelled by fan already")
        }

        // for rejecting requests by influencer
        if (type === "decline") {
            // check if its already declined
            if (request.status === RequestStatus.REJECTED) {
                return this.internalResponse(false, {}, 400, "Request declined already")
            }
            
            // check if exists and is for the influencer
            if (request.influencer.id != user_exists.id) {
                return this.internalResponse(false, {}, 400, "Request not for you")
            }
        }

        // for accepting requests by influencer
        if (type === "accept") {
            // check if its already accepted
            if (request.status === RequestStatus.ACCEPTED) {
                return this.internalResponse(false, {}, 400, "Request accepted already")
            }
            
            // check if exists and is for the influencer
            if (request.influencer.id != user_exists.id) {
                return this.internalResponse(false, {}, 400, "Request not for you")
            }

            // check if already expired after 72 hours
            if (new Date(request.created_at).getTime() + 262800000 < Date.now()) {
                return this.internalResponse(false, {}, 400, "Request time has elaspsed")
            }
        }

        // start transactions
        const connection = getConnection()
        const queryRunner = connection.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()
        try {
            const fan_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: request.fan }]
            })
            const influencer_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: request.influencer }]
            })
            const fan_balance = 
                type == "decline" ?
                    parseFloat(fan_wallet.ledger_balance) + parseFloat(request.rate)
                :   
                    parseFloat(fan_wallet.wallet_balance) - parseFloat(request.rate)
            const influencer_balance = 
                type == "decline" ?
                    parseFloat(influencer_wallet.ledger_balance) - parseFloat(request.rate)
                :
                    parseFloat(influencer_wallet.wallet_balance) + parseFloat(request.rate)
      
            await queryRunner.manager.update(
                Wallet,
                fan_wallet.id,
                { 
                    ledger_balance: type == "decline" ? fan_balance.toFixed(2) : fan_wallet.ledger_balance,
                    wallet_balance: type == "accept" ? fan_balance.toFixed(2) : fan_wallet.wallet_balance,
                }
            )
            await queryRunner.manager.update(
                Wallet,
                influencer_wallet.id,
                { 
                    ledger_balance: type == "decline" ? influencer_balance.toFixed(2) : influencer_wallet.ledger_balance,
                    wallet_balance: type == "accept" ? influencer_balance.toFixed(2) : influencer_wallet.wallet_balance,
                }
            )

            // update the request
            const updatedRequest = await queryRunner.manager.update(
                Requests, 
                request.id, 
                { 
                    status: type == "decline" ? RequestStatus.REJECTED : RequestStatus.ACCEPTED,
                    reason: type == "decline" && reason
                }
            )
            await queryRunner.commitTransaction()

            // create a room for both users
            const room = await roomService.createRoom(request.fan, user_exists);

            return this.internalResponse(
                true,
                { request: updatedRequest , room },
                200,
                `Request ${type == 'decline' ? 'declined' : 'accepted'} successfully`
            )
        } catch (error) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {},
              400,
              "Request response not successful. Please try again"
            )
        }
    }

    public async cancelRequest(authUser: jwtCred, requestId: number) {
        const user_id = authUser.id;
        const user_exists = await userService.findUserWithId(user_id)
        if (!user_exists) {
          return this.internalResponse(false, {}, 400, "user not found")
        }
    
        const request = await this.findRequestWithId(requestId);
        if (!request) {
            return this.internalResponse(false, {}, 400, "Request doesn't exist")
        }

        // check if request has been cancelled already
        if (request.status === RequestStatus.CANCELLED) {
            return this.internalResponse(false, {}, 400, "Request has been cancelled already")
        }
    
        // check if request was made by me
        if (request.fan.id != user_exists.id) {
            return this.internalResponse(false, {}, 400, "Can't cancel someone else's request")
        }

        // check if request has been accepted by influencer already
        if (request.status === RequestStatus.ACCEPTED) {
            return this.internalResponse(false, {}, 400, "Requests once accepted cannot be cancelled")
        }

        // start transactions
        const connection = getConnection()
        const queryRunner = connection.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const fan_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: request.fan }]
            })
            const influencer_wallet = await queryRunner.manager.findOne(Wallet, {
                where: [{ user: request.influencer }]
            })

            const fan_ledger_balance = parseFloat(fan_wallet.ledger_balance) + parseFloat(request.rate)
            const influencer_ledger_balance = parseFloat(influencer_wallet.ledger_balance) - parseFloat(request.rate)

            await queryRunner.manager.update(
                Wallet,
                fan_wallet.id,
                { 
                    ledger_balance: fan_ledger_balance.toFixed(2)
                }
            )
            await queryRunner.manager.update(
                Wallet,
                influencer_wallet.id,
                { 
                    ledger_balance: influencer_ledger_balance.toFixed(2)
                }
            )

            // update the request
            const updatedRequest = await queryRunner.manager.update(
                Requests, 
                request.id, 
                { 
                    status: RequestStatus.CANCELLED,
                }
            )
            await queryRunner.commitTransaction()

            return this.internalResponse(
              true,
              { },
              200,
              "Request cancelled"
            )
        } catch (error) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {},
              400,
              "Request cancelation not successful. Please try again"
            )
        }

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
            relations: ["influencer", "fan"]
        })
    }

}

export const requestService = new RequestService()