import {Admin} from "./admin.model"
import { BaseService } from "../../helpers/db.helper"
import { fanService } from "../fan/fan.services"
import { userService } from "../user/user.services"
import { AccountType } from "../../utils/enum"
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
}


export const adminService = new AdminService()