import {Admin} from "./admin.model"
import { BaseService } from "../../helpers/db.helper"
import { fanService } from "../fan/fan.services"
import { userService } from "../user/user.services"
import { AccountType, jwtCred, LiveVideoVerificationStatus } from "../../utils/enum"
import { authService } from "../auth/auth.services"
import { requestService } from "../requests/request.services"
import { walletService } from "../wallet/wallet.services"
import { influencerService } from "../influencer/influencer.services"
import { transactionService } from "../transactions/transaction.services"


class AdminService extends BaseService { 
 public async adminDashboard() {

  //get the total analytics
  //total fans
  const all_fans_count = await userService.findAllUsers(AccountType.FAN);
  //total influencers
  const all_influencers_count =  await userService.findAllUsers(AccountType.CELEB)
  //total sign ups
  const sign_ups_count = await authService.getAllSignUpsCount()
  //total fan requests
  const {list: requests, count} = await requestService.allRequestsCount()
  const total_fan_requests_count = count
  //total earnings
  const total_earnings = await walletService.allEarnings()

  //get the recent verifications
  const recent_verifications_unverified = await influencerService.getInfluencerWithVerifications(false)
  
  let recent_verifications_verified: any
  if(recent_verifications_unverified?.length < 0 || recent_verifications_unverified?.length < 3){
   recent_verifications_verified = await influencerService.getInfluencerWithVerifications(true)
  }

  const recent_verifications =  recent_verifications_unverified.concat(recent_verifications_verified)

   
  //get the recent transactions
  const recent_transactions = await transactionService.getAllTransactions()


  //get all requests a
  const all_requests = requests


  const response = {
   all_fans_count,
   all_influencers_count,
   sign_ups_count,
   total_fan_requests_count,
   total_earnings,
   recent_verifications,
   recent_transactions,
   all_requests
  }

  return this.internalResponse(true, response, 200, "Dashboard retrieved!")
 }


 public async influencersContent() {
  //influencers details
  const {list: influencers, count} = await influencerService.getInfluencersForAdmin()

  const {list: influencersReq, count: influencersReqCount} = await requestService.allRequestsCount()

  const transactions = await transactionService.getAllTransactions()
  
  const response = {
   influencers,
   count,
   influencers_requests: influencersReq,
   influencers_req_count: influencersReqCount,
   transactions
  }

  return this.internalResponse(true, response, 200, "influencers content retrieved!")
 }

 public async fansContent() {
  //fan details
  const {list: fans, count} = await fanService.getFansForAdmin()

  const {list: fansReq, count: fansReqCount} = await requestService.allRequestsCount()

  const transactions = await transactionService.getAllTransactions()

  const response = {
   fans,
   count,
   fans_request: fansReq,
   fans_req_count: fansReqCount,
   transactions
  }

  return this.internalResponse(true, response, 200, "fans content retrieved!")
 }

 public async verificationContent() {
  //verification content
  const {list: new_influencers, count: new_influencers_count} = await influencerService.getNewlyRegisteredInfluencers()

  const {list: verified_influencers, count: verified_influencers_count} =  await influencerService.getVerifiedInfluencers()

  const {list: unverified_influencers, count: unverified_influencers_count} = await influencerService.getUnverifiedInfluencers()

  const response = {
   new_influencers,
   new_influencers_count,
   verified_influencers,
   verified_influencers_count,
   unverified_influencers,
   unverified_influencers_count
  }

  return this.internalResponse(true, response, 200, "verification content retrieved!")
 }

 public async verifyLiveVideoForInfluencer(authUser: jwtCred, verifyDTO: {verify_video: LiveVideoVerificationStatus, influencerId: number}) {
  const {verify_video, influencerId} = verifyDTO

  const influencer_exists = await influencerService.findInfluencerById(influencerId)

  if(!influencer_exists){
   return this.internalResponse(false, {}, 400, "Influencer does not exist")
  }

  if(influencer_exists.live_video_verification_status === LiveVideoVerificationStatus.VERIFIED  && verify_video === LiveVideoVerificationStatus.VERIFIED){ 
   return this.internalResponse(false, {}, 400, "Influencer's video has been verified initally")
  }

  if(influencer_exists.live_video_verification_status === LiveVideoVerificationStatus.DECLINED && verify_video === LiveVideoVerificationStatus.DECLINED) {
   return this.internalResponse(false, {}, 400, "Influencer's video has been declined initailly")
  }

  const update_details = {
   live_video_verification_status: verify_video
  }

  //update the user
  const result  = await influencerService.updateInfluencer(influencer_exists, update_details)

  if(!result) {
   return this.internalResponse(false, {}, 400, "failed to update user")
  }

  delete result.password
  delete result.email_verification

  return this.internalResponse(true, result, 200, "Influencer video status updated!")
 }
}


export const adminService = new AdminService()