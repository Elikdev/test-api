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
import { ShoutOutVideos } from "./shoutOut.model";
import { Fan } from "../fan/fan.model"
import { Influencer } from "../influencer/influencer.model"
import { fanService } from "../fan/fan.services";

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

            //change will occur here
            scheduleRequestJobChecker(in72hours, cronFunParam)

            return this.internalResponse(true, { request: reques }, 200, "Request created")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {error: error},
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
            const resUpdatedRequest = await queryRunner.manager.findOne(Requests, {where: {id: request.id}})
            await queryRunner.commitTransaction()

            // create a room for both users
            const room = await roomService.createRoom(request.fan, user_exists);

            delete room.fan.password
            delete room.fan.email_verification
            delete room.influencer.password
            delete room.influencer.email_verification

            return this.internalResponse(
                true,
                { request: resUpdatedRequest , room },
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

        // check if request has been declined by influencer already
        if (request.status === RequestStatus.REJECTED) {
            return this.internalResponse(false, {}, 400, "Request declined already")
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
            await queryRunner.manager.update(
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

    public async shoutOutVideoInstance(video_url: string,  request: Requests, fan: Fan, influencer: Influencer ) {
        const new_shout_out = new ShoutOutVideos()

        new_shout_out.video_url = video_url
        new_shout_out.request = request
        new_shout_out.fan = fan
        new_shout_out.influencer = influencer

        return new_shout_out
    }

    public async saveShoutOut(sov: ShoutOutVideos) {
        const saved_shout_out = await this.save(ShoutOutVideos, sov)

        return saved_shout_out
    }

    public async saveShoutOutVideos(SvDTO: {requestId: number, video_url: string}) {
        const { requestId, video_url } = SvDTO

        //check for the request if it exists
        const request_exists = await this.findRequestWithId(requestId)

        if(!request_exists) {
            return this.internalResponse(false, {}, 400, "Request does not exist")
        }

        //check if the request is a shout out 
        if(request_exists.request_type !== "shout out") {
            return this.internalResponse(false, {}, 400, "Request type must be a shout out")
        }

        //get the fan and the influnecer Id from the request
        const { fan, influencer } = request_exists

        //find fan by id
        const fan_exists = await fanService.findFanById(fan.id)

        if(!fan_exists) {
            return this.internalResponse(false, {}, 400, "Invalid request as fan does not exist")
        }

        //find influencer by id
        const influencer_exists = await influencerService.findInfluencerById(influencer.id)

        if(!influencer_exists) {
            return this.internalResponse(false, {}, 400, "Invalid request as influencer does not esist")
        }

        //save the shout out video
        const new_shout_out_video = await this.shoutOutVideoInstance(video_url, request_exists, fan_exists, influencer_exists)

        const saved_shout_out_video = await this.saveShoutOut(new_shout_out_video) 

        if(!saved_shout_out_video) {
            return this.internalResponse(false, {}, 400, "Failed to save the shout out video")
        }

        const {fan:req_fan, influencer:req_influencer, ...requestData} = saved_shout_out_video.request
        const {password, email_verification, ...influencerData} = saved_shout_out_video.influencer
        const {password:fanPwrd, email_verification:fanEv, ...fanData} = saved_shout_out_video.fan

        const response = {...saved_shout_out_video, request: requestData, fan: fanData, influencer: influencerData}

        return this.internalResponse(true, response, 200, "Shout out video saved successfully")
    }

    public async getAllShoutOutVideos() {
        const [soVideos, count] = await getRepository(ShoutOutVideos).findAndCount({
            relations: ['request', "influencer", "fan" ]
        }) 

        if(soVideos.length <= 0) {
            return this.internalResponse(false, {}, 400, "No shout out videos available")
        }

        for (const soVideo of soVideos) {
            delete soVideo.request.fan
            delete soVideo.request.influencer
            delete soVideo.fan.password
            delete soVideo.fan.email_verification
            delete soVideo.influencer.password
            delete soVideo.influencer.email_verification
        }

        return this.internalResponse(true, {soVideos, total: count}, 200, "Shout out videos retrieved")
        
    }

    public async getAllShoutOutVideosForUser(authUser: jwtCred) {
        const userId = authUser.id

        const [soVideos, count] = await getRepository(ShoutOutVideos).findAndCount({
            where: [
                {fan: userId},
                {influencer: userId}
            ],
            relations: ['request', "influencer", "fan" ]
        }) 

        if(soVideos.length <= 0) {
            return this.internalResponse(false, {}, 400, "No shout out videos available")
        }

        for (const soVideo of soVideos) {
            delete soVideo.request.fan
            delete soVideo.request.influencer
            delete soVideo.fan.password
            delete soVideo.fan.email_verification
            delete soVideo.influencer.password
            delete soVideo.influencer.email_verification
        }

        return this.internalResponse(true, {soVideos, total: count}, 200, "Shout out videos retrieved")
    }

    public async getAllShoutOutVideosByInfluencer(influencerId: number) {

        //if the influencer eists
        const influencer_exists = await influencerService.findInfluencerById(influencerId)

        if(!influencer_exists) {
            return this.internalResponse(false, {}, 400, "Influencer does not exist")
        }

        const [soVideos, count] = await getRepository(ShoutOutVideos).findAndCount({
            where: {influencer: influencer_exists.id},
            relations: ['request', "influencer", "fan" ]
        }) 

        if(soVideos.length <= 0) {
            return this.internalResponse(false, {}, 400, "No shout out videos available")
        }

        for (const soVideo of soVideos) {
            delete soVideo.request.fan
            delete soVideo.request.influencer
            delete soVideo.fan.password
            delete soVideo.fan.email_verification
            delete soVideo.influencer.password
            delete soVideo.influencer.email_verification
        }

        return this.internalResponse(true, {soVideos, total: count}, 200, "Shout out videos retrieved")
    }

    public async allRequestsCount() {
        const [list, count] = await getRepository(Requests).findAndCount({
            order: {updated_at: "DESC"},
            relations: ["fan", "influencer"]
        })

        if(list.length > 0){
           for (const req of list) {
               delete req.fan.email_verification
               delete req.influencer.email_verification
               delete req.fan.password,
               delete req.influencer.password
           }
        }
       
        return {
            list,
            count
        };

    }

}

export const requestService = new RequestService()
