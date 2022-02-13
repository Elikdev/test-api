import { Admin } from "./admin.model"
import { BaseService } from "../../helpers/db.helper"
import { fanService } from "../fan/fan.services"
import { userService } from "../user/user.services"
import {
  AccountType,
  AdminCategory,
  campaignStatus,
  campaignType,
  jwtCred,
  LiveVideoVerificationStatus,
  RoleType,
  searchFieldType,
  transactionSettingsType,
} from "../../utils/enum"
import { authService } from "../auth/auth.services"
import { requestService } from "../requests/request.services"
import { walletService } from "../wallet/wallet.services"
import { influencerService } from "../influencer/influencer.services"
import { transactionService } from "../transactions/transaction.services"
import { getRepository, Like, ILike, MoreThanOrEqual, getConnection } from "typeorm"
import { User } from "../user/user.model"
import { Settings } from "./settings.model"
import { AuthModule } from "../../utils/auth"
import {extname} from "path"
import { Readable } from "stream"
import readXlsxFile from "read-excel-file/node"
import csv2 from "csvtojson"
import * as fs from "fs"
import moment from "moment"
import { Influencer } from "../influencer/influencer.model"
import { compileEjs, sendEmail } from "../../helpers/mailer.helper"
import { Campaign } from "./campaign.model"
import { scheduleRequestJobChecker } from "../../helpers/cronjobs"

class AdminService extends BaseService {
  public async adminDashboard() {
    //get the total analytics
    //total fans
    const all_fans_count = await userService.findAllUsers(AccountType.FAN)
    //total influencers
    const all_influencers_count = await userService.findAllUsers(
      AccountType.CELEB
    )
    //total sign ups
    const sign_ups_count = await authService.getAllSignUpsCount()
    //total fan requests
    const { list: requests, count } = await requestService.allRequestsCount()
    const total_fan_requests_count = count
    //total earnings
    const total_earnings = await walletService.allEarnings()

    //get the recent verifications
    const recent_verifications_unverified =
      await influencerService.getInfluencerWithVerifications(false)

    let recent_verifications_verified: any
    if (
      recent_verifications_unverified?.length < 0 ||
      recent_verifications_unverified?.length < 3
    ) {
      recent_verifications_verified =
        await influencerService.getInfluencerWithVerifications(true)
    }

    const recent_verifications = recent_verifications_unverified.concat(
      recent_verifications_verified
    )

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
      all_requests,
    }

    return this.internalResponse(true, response, 200, "Dashboard retrieved!")
  }

  public async influencersContent() {
    //influencers details
    const { list: influencers, count } =
      await influencerService.getInfluencersForAdmin()

    const { list: influencersReq, count: influencersReqCount } =
      await requestService.allRequestsCount()

    const transactions = await transactionService.getAllTransactions()

    const response = {
      influencers,
      count,
      influencers_requests: influencersReq,
      influencers_req_count: influencersReqCount,
      transactions,
    }

    return this.internalResponse(
      true,
      response,
      200,
      "influencers content retrieved!"
    )
  }

  public async fansContent() {
    //fan details
    const { list: fans, count } = await fanService.getFansForAdmin()

    const { list: fansReq, count: fansReqCount } =
      await requestService.allRequestsCount()

    const transactions = await transactionService.getAllTransactions()

    const response = {
      fans,
      count,
      fans_request: fansReq,
      fans_req_count: fansReqCount,
      transactions,
    }

    return this.internalResponse(true, response, 200, "fans content retrieved!")
  }

  public async verificationContent() {
    //verification content
    const { list: new_influencers, count: new_influencers_count } =
      await influencerService.getNewlyRegisteredInfluencers()

    const { list: verified_influencers, count: verified_influencers_count } =
      await influencerService.getVerifiedInfluencers()

    const {
      list: unverified_influencers,
      count: unverified_influencers_count,
    } = await influencerService.getUnverifiedInfluencers()

    const response = {
      new_influencers,
      new_influencers_count,
      verified_influencers,
      verified_influencers_count,
      unverified_influencers,
      unverified_influencers_count,
    }

    return this.internalResponse(
      true,
      response,
      200,
      "verification content retrieved!"
    )
  }

  public async verifyLiveVideoForInfluencer(
    authUser: jwtCred,
    verifyDTO: {
      verify_video: LiveVideoVerificationStatus
      influencerId: number
    }
  ) {
    const { verify_video, influencerId } = verifyDTO

    const influencer_exists = await influencerService.findInfluencerById(
      influencerId
    )
    let is_admin_verified

    if (!influencer_exists) {
      return this.internalResponse(false, {}, 400, "Influencer does not exist")
    }

    if (
      influencer_exists.live_video_verification_status ===
        LiveVideoVerificationStatus.VERIFIED &&
      verify_video === LiveVideoVerificationStatus.VERIFIED
    ) {
      return this.internalResponse(
        false,
        {},
        400,
        "Influencer's video has been verified initally"
      )
    }

    if (
      influencer_exists.live_video_verification_status ===
        LiveVideoVerificationStatus.DECLINED &&
      verify_video === LiveVideoVerificationStatus.DECLINED
    ) {
      return this.internalResponse(
        false,
        {},
        400,
        "Influencer's video has been declined initailly"
      )
    }

    if (verify_video === LiveVideoVerificationStatus.DECLINED) {
      is_admin_verified = false
    }

    if (verify_video === LiveVideoVerificationStatus.VERIFIED) {
      is_admin_verified = true
    }

    const update_details = {
      live_video_verification_status: verify_video,
      is_admin_verified: is_admin_verified,
    }

    //update the user
    const result = await influencerService.updateInfluencer(
      influencer_exists,
      update_details
    )

    if (!result) {
      return this.internalResponse(false, {}, 400, "failed to update user")
    }

    delete result.password
    delete result.email_verification

    return this.internalResponse(
      true,
      result,
      200,
      "Influencer video status updated!"
    )
  }

  public async getAllAdmins() {
    const [list, count] = await getRepository(User).findAndCount({
      where: { role: RoleType.BAMIKI_ADMIN },
      order: { created_at: "DESC" },
    })

    for (const admin of list) {
      delete admin.password
      delete admin.email_verification
    }

    const response = {
      admins: list,
      count,
    }

    return this.internalResponse(true, response, 200, "Admins retrieved")
  }

  public async setTransactionSettings(
    authUser: jwtCred,
    setDTO: { type: transactionSettingsType; value: number }
  ) {
    const { type, value } = setDTO
    let response: any

    const settings_exists = await getRepository(Settings).find({})
    let update_details: any

    if (settings_exists.length <= 0) {
      const new_settings = new Settings()
      if (type === transactionSettingsType.TRANSACTION_FEE) {
        //check if transaction fee has been set before
        //create a new one if it has not been set
        new_settings.transaction_fee = value
      }
      if (type === transactionSettingsType.EXPRESS_TIMELINE) {
        //update the delivery timeline for express
        new_settings.express_delivery_time = value
      }

      if (type === transactionSettingsType.STANDARD_TIMELINE) {
        new_settings.standard_delivery_time = value
      }

      if (type === transactionSettingsType.EXPRESS_FEE) {
        new_settings.express_delivery_fee = value
      }

      //save the settings
      response = await this.save(Settings, new_settings)
    } else {
      const actual_settings = settings_exists[0]
      //update the settings
      if (type === transactionSettingsType.TRANSACTION_FEE) {
        //update transaction_fee
        update_details = {
          transaction_fee: value,
        }
      }
      if (type === transactionSettingsType.EXPRESS_TIMELINE) {
        //update the delivery timeline for express
        update_details = {
          express_delivery_time: value,
        }
      }

      if (type === transactionSettingsType.STANDARD_TIMELINE) {
        update_details = {
          standard_delivery_time: value,
        }
      }

      if (type === transactionSettingsType.EXPRESS_FEE) {
        update_details = {
          express_delivery_fee: value,
        }
      }

      this.schema(Settings).merge(actual_settings, update_details)
      response = await this.updateOne(Settings, actual_settings)
    }

    if (!response) {
      return this.internalResponse(false, {}, 400, "Unable to update settings")
    }

    return this.internalResponse(true, response, 200, "Settings updated!")
  }

  public async addNewAdmin(
    authUser: jwtCred,
    adminDTO: {
      full_name: string
      email: string
      phone_number: string
      country_code: number
      password: string
      admin_category: AdminCategory
      permissions: string[]
    }
  ) {
    let {
      full_name,
      email,
      password,
      admin_category,
      country_code,
      permissions,
      phone_number,
    } = adminDTO

    const admin_id = authUser.id

    const admin = await this.findOne(Admin, {
      where: { id: admin_id },
    })

    if (admin?.admin_category === AdminCategory.SUB_ADMIN) {
      return this.internalResponse(
        false,
        {},
        400,
        "You do not have enough access to perform this action"
      )
    }

    //check if the admin has been added intially
    email = email.toLowerCase()

    const admin_exists = await this.findOne(Admin, {
      where: [{ email }, { phone_number }],
    })

    const admin_exists_as_users = await this.findOne(User, {
      where: [{ email }, { phone_number }],
    })
    if (admin_exists || admin_exists_as_users) {
      return this.internalResponse(
        false,
        {},
        400,
        "Admin/User with the same email or phone number exists already"
      )
    }

    //hash password
    const hashedPassword = AuthModule.hashPassWord(password)

    const new_admin = new Admin()
    new_admin.full_name = full_name
    new_admin.email = email
    new_admin.password = hashedPassword
    new_admin.phone_number = phone_number
    new_admin.country_code = country_code
    new_admin.handle = `admin-${AuthModule.generateUniqueCode(5)}`
    new_admin.is_verified = true
    new_admin.admin_category = admin_category
    new_admin.permissions = permissions
    new_admin.role = RoleType.BAMIKI_ADMIN

    const new_admin_saved = await this.save(Admin, new_admin)

    if (!new_admin_saved) {
      return this.internalResponse(false, {}, 400, "Failed to save new admin")
    }

    delete new_admin_saved.password

    return this.internalResponse(
      true,
      new_admin_saved,
      200,
      "New admin added successfully!"
    )
  }

  public async editAdminProfile(
    authUser: jwtCred,
    adminDTO: { email: string; password: string }
  ) {
    const admin_id = authUser.id

    const admin = await this.findOne(Admin, {
      where: { id: admin_id },
    })

    let { email, password } = adminDTO

    email = email.toLowerCase()
    password = AuthModule.hashPassWord(password)

    if (email !== admin.email) {
      //check if the email exists
      const admin_exists = await this.findOne(User, {
        where: { email },
      })

      if (admin_exists) {
        return this.internalResponse(false, {}, 400, "Email exists already")
      }
    } else {
      email = admin.email
    }

    //update the admin profile
    const update_details = {
      email,
      password,
    }

    this.schema(Admin).merge(admin, update_details)

    const admin_updated = await this.updateOne(Admin, admin)

    if (!admin_updated) {
      return this.internalResponse(false, {}, 400, "Failed to update admin!")
    }

    return this.internalResponse(
      true,
      admin_updated,
      200,
      "Admin profile updated successfully!"
    )
  }

  public async updateAdminStatus(
    authUser: jwtCred,
    adminDTO: { type: string; adminId: number }
  ) {
    const id = authUser.id
    let { type, adminId } = adminDTO

    type = type.toLowerCase()

    if (id === adminId) {
      return this.internalResponse(
        false,
        {},
        400,
        "You are not allowed to perform this action"
      )
    }

    const admin_exists = await this.findOne(Admin, {
      where: { id: adminId },
    })

    if (!admin_exists) {
      return this.internalResponse(false, {}, 400, "Invalid admin id")
    }

    let update_details

    if (type === "deactivate") {
      update_details = {
        blocked: true,
      }
    }

    if (type === "activate") {
      update_details = {
        blocked: false,
      }
    }

    if (type === "delete") {
      update_details = {
        deleted: true,
      }
    }

    if (type === "restore") {
      update_details = {
        deleted: false,
      }
    }

    //merge
    this.schema(Admin).merge(admin_exists, update_details)

    const admin_updated = await this.updateOne(Admin, admin_exists)

    if (!admin_updated) {
      return this.internalResponse(
        false,
        {},
        400,
        "Failed to update admin status"
      )
    }

    return this.internalResponse(true, {}, 200, "Admin updated successfully!")
  }

  public async getTransactionSettings() {
    const settings = await getRepository(Settings).find({})

    if (settings.length < 0) {
      return this.internalResponse(false, {}, 400, "No settings found!")
    }

    return this.internalResponse(true, settings[0], 200, "Settings retrieved!")
  }

  public async newEmailCampaign(
    authUser: jwtCred,
    adminDTO: {
      campaign_name: string
      sender: string
      message: any
      schedule: boolean
      recipient_file: any
      schedule_date: any
    }
  ) {
    const {
      campaign_name,
      sender,
      message,
      schedule,
      recipient_file,
      schedule_date,
    } = adminDTO

    // if (extname(recipient_file?.originalname) === ".xlsx") {
    //   /* tslint:disable-next-line: no-string-literal */
    //   const stream = Readable["from"](recipient_file.buffer)
    //   const files = await readXlsxFile(stream)

    //   files.shift()

    //   let recipient_files = []

    //   files.forEach((row) => {
    //     let recipient_file = {
    //       fullName: row[1],
    //       email: row[2],
    //     }
    //     recipient_files.push(recipient_file)
    //   })
    //   return this.internalResponse(
    //     true,
    //     recipient_files,
    //     200,
    //     "File is in excel format"
    //   )
    // }

    // if (extname(recipient_file?.originalname) === ".csv") {
    //   let csv_rows = []
    //   let actual_rows = []
    //   /* tslint:disable-next-line: no-string-literal */
    //   const stream = Readable["from"](recipient_file.buffer)

    //   const data_csv = await csv2().fromStream(stream)
    // }

    //start transaction
    const connection = getConnection()
    const queryRunner = connection.createQueryRunner()

    await queryRunner.connect()

    await queryRunner.startTransaction()

    try {
      //get all the registered users
      const { users } = await userService.findAllVerifiedUsers()

      if (users.length <= 0) {
        return this.internalResponse(
          false,
          {},
          400,
          "No users found on the platform"
        )
      }
      if (schedule) {
        //save to db
        for (const user of users) {
          const newCampaign = queryRunner.manager.create(Campaign, {
            campaign_name: campaign_name,
            sender: sender,
            status: campaignStatus.SCHEDULED,
            user: user,
            text: message,
            type: campaignType.EMAIL,
          })

          const campaign_saved = await queryRunner.manager.save(newCampaign)

          if (!campaign_saved) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {},
              400,
              "Error in sending out campaigns"
            )
          }
        }

        await queryRunner.commitTransaction()

        // create function for scheduled job
        const scheduledFunct = async () => {
          //get all the registered users
          const { users } = await userService.findAllVerifiedUsers()

          for (const user of users) {
            const htmlMessage = compileEjs({ template: "campaign-template" })({
              name: `${
                Array.isArray(user.full_name.split(" "))
                  ? user.full_name.split(" ")[0]
                  : user.full_name
              }`,
              message: message,
            })

            const email_sent = await sendEmail({
              html: htmlMessage,
              subject: campaign_name,
              to: user.email.toLowerCase(),
            })

            if (email_sent) {
              const campaign = await this.findOne(Campaign, {
                where: { user: user.id, campaign_name },
              })

              if (campaign.status === campaignStatus.SCHEDULED) {
                await getConnection()
                  .createQueryBuilder()
                  .update(Campaign)
                  .set({ status: campaignStatus.DELIVERED })
                  .where("id = :id", { id: campaign.id })
                  .execute()
              }
            }
          }
        }

        scheduleRequestJobChecker(schedule_date, scheduledFunct)

        return this.internalResponse(
          true,
          {},
          200,
          "Your email camapaign has been scheduled successfully"
        )
      }

      for (const user of users) {
        const htmlMessage = compileEjs({ template: "campaign-template" })({
          name: `${
            Array.isArray(user.full_name.split(" "))
              ? user.full_name.split(" ")[0]
              : user.full_name
          }`,
          message: message,
        })

        const email_sent = await sendEmail({
          html: htmlMessage,
          subject: campaign_name,
          to: user.email.toLowerCase(),
        })

        if (!email_sent) {
          return this.internalResponse(
            false,
            { email: user.email },
            400,
            "Error in sending mail to this particular email"
          )
        }

        //save to db
        const newCampaign = queryRunner.manager.create(Campaign, {
          campaign_name: campaign_name,
          sender: sender,
          status: campaignStatus.DELIVERED,
          user: user,
          text: message,
          type: campaignType.EMAIL,
        })

        const email_saved = await queryRunner.manager.save(newCampaign)

        if (!email_saved) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return this.internalResponse(
            false,
            {},
            400,
            "A campaign was not saved"
          )
        }
      }

      await queryRunner.commitTransaction()

      return this.internalResponse(
        true,
        {},
        200,
        "Emails were sent successfully!"
      )
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

  public async newSmsCampaign(
    authUser: jwtCred,
    adminDTO: {
      campaign_name: string
      sender: string
      message: any
      schedule: Boolean
      recipient_file: any
      schedule_date: any
    }
  ) {
    const {
      campaign_name,
      sender,
      message,
      recipient_file,
      schedule,
      schedule_date,
    } = adminDTO

    // if (extname(recipient_file?.originalname) === ".xlsx") {
    //   /* tslint:disable-next-line: no-string-literal */
    //   const stream = Readable["from"](recipient_file.buffer)
    //   const files = await readXlsxFile(stream)

    //   files.shift()

    //   let recipient_files = []

    //   files.forEach((row) => {
    //     let recipient_file = {
    //       fullName: row[1],
    //       email: row[2],
    //     }
    //     recipient_files.push(recipient_file)
    //   })
    //   return this.internalResponse(
    //     true,
    //     recipient_files,
    //     200,
    //     "File is in excel format"
    //   )
    // }

    // if (extname(recipient_file?.originalname) === ".csv") {
    //   /* tslint:disable-next-line: no-string-literal */
    //   const stream = Readable["from"](recipient_file.buffer)

    //   const data_csv = await csv2().fromStream(stream)

    //   return this.internalResponse(true, data_csv, 200, "file is in csv")
    // }

    //start transaction
    const connection = getConnection()
    const queryRunner = connection.createQueryRunner()

    await queryRunner.connect()

    await queryRunner.startTransaction()

    try {
      //get all the registered users
      const { users } = await userService.findAllVerifiedUsers()

      if (users.length <= 0) {
        return this.internalResponse(
          false,
          {},
          400,
          "No users found on the platform"
        )
      }

      
      if (schedule) {
        //save to db
        for (const user of users) {
          const newCampaign = queryRunner.manager.create(Campaign, {
            campaign_name: campaign_name,
            sender: sender,
            status: campaignStatus.SCHEDULED,
            user: user,
            text: message,
            type: campaignType.SMS,
          })

          const campaign_saved = await queryRunner.manager.save(newCampaign)

          if (!campaign_saved) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return this.internalResponse(
              false,
              {},
              400,
              "Error in sending out campaigns"
            )
          }
        }

        await queryRunner.commitTransaction()

        // create function for scheduled job
        const scheduledFunct = async () => {
          //get all the registered users
          const { users } = await userService.findAllVerifiedUsers()

          for (const user of users) {
            const sms_sent = false

            if (sms_sent) {
              const campaign = await this.findOne(Campaign, {
                where: { user: user.id, campaign_name },
              })

              if (campaign.status === campaignStatus.SCHEDULED) {
                await getConnection()
                  .createQueryBuilder()
                  .update(Campaign)
                  .set({ status: campaignStatus.DELIVERED })
                  .where("id = :id", { id: campaign.id })
                  .execute()
              }
            }
          }
        }

        scheduleRequestJobChecker(schedule_date, scheduledFunct)

        return this.internalResponse(
          true,
          {},
          200,
          "Your email camapaign has been scheduled successfully"
        )
      }

      for (const user of users) {
        //twilio bulk sms comes in here
        const sms_sent = false

        if (!sms_sent) {
          return this.internalResponse(
            false,
            { phone_number: user.phone_number },
            400,
            "Error in sending sms to phone number"
          )
        }

        //save to db
        const newCampaign = queryRunner.manager.create(Campaign, {
          campaign_name: campaign_name,
          sender: sender,
          status: campaignStatus.DELIVERED,
          user: user,
          text: message,
          type: campaignType.SMS,
        })

        const sms_saved = await queryRunner.manager.save(newCampaign)

        if (!sms_saved) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return this.internalResponse(
            false,
            {},
            400,
            "A campaign was not saved"
          )
        }
      }

      await queryRunner.commitTransaction()

      return this.internalResponse(true, {}, 200, "Sms were sent successfully!")
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

  public async searchAndFilter(searchDTO: {
    field: searchFieldType
    value: string
    filter: string
    page: number
    limit: number
  }) {
    const { field, value, filter, page, limit } = searchDTO
    let queryOptions = {}
    let results = { count: 0, result: [] }
    const offset = (page - 1) * limit

    //by default is to search for users
    if (!field && !value) {
      queryOptions = {
        is_verified: true,
        role: RoleType.BAMIKI_USER,
      }

      const [list, count] = await getRepository(User).findAndCount({
        where: queryOptions,
        skip: offset,
        take: limit,
        order: { created_at: "DESC" },
      })

      if (count > 0) {
        for (const res of list) {
          delete res.password
          delete res.email_verification
        }
        results.count = count
        results.result = list
      }
    } else if (field === searchFieldType.FAN) {
      queryOptions = {
        is_verified: true,
        account_type: AccountType.FAN,
      }
      let res_list = []
      let res_count = 0
      //by default filter is by name
      if (filter === "request") {
        const { list, count } = await requestService.allRequestsCount()
        if (count > 0) {
          const filter_value = list.find(
            (req) => req.fan.full_name.toLowerCase() === value.toLowerCase()
          )
          if (filter_value) {
            res_list.push(filter_value)
            res_count = 1
          }
        }
      } else if (filter === "date") {
        if (moment(value).isValid() === false) {
          return this.internalResponse(
            false,
            {},
            400,
            "Date must be in format YYYY-MM-DD"
          )
        }
        const start_date = moment(value).startOf("day")

        const [list, count] = await getRepository(User).findAndCount({
          where: {
            created_at: MoreThanOrEqual(start_date),
            ...queryOptions,
          },
          order: { created_at: "ASC" },
          skip: offset,
          take: limit,
        })
        res_list = list
        res_count = count
      } else {
        const [list, count] = await getRepository(User).findAndCount({
          where: [
            { full_name: ILike(`%${value}%`), ...queryOptions },
            { handle: ILike(`%${value}%`), ...queryOptions },
          ],
          order: { full_name: "ASC" },
          skip: offset,
          take: limit,
        })

        res_list = list
        res_count = count
      }

      if (res_count > 0) {
        for (const res of res_list) {
          delete res?.email_verification
          delete res?.password
        }
      }
      results.result = res_list
      results.count = res_count
    } else if (field === searchFieldType.INFLUENCER) {
      queryOptions = {
        is_verified: true,
        account_type: AccountType.CELEB,
      }
      let res_list = []
      let res_count = 0
      //by default filter is by name
      if (filter === "request") {
        const { list, count } = await requestService.allRequestsCount()
        if (count > 0) {
          const filter_value = list.find(
            (req) =>
              req.influencer.full_name.toLowerCase() === value.toLowerCase()
          )
          if (filter_value) {
            res_list.push(filter_value)
            res_count = 1
          }
        }
      } else if (filter === "date") {
        if (moment(value).isValid() === false) {
          return this.internalResponse(
            false,
            {},
            400,
            "Date must be in format YYYY-MM-DD"
          )
        }
        const start_date = moment(value).startOf("day")
        const [list, count] = await getRepository(User).findAndCount({
          where: {
            created_at: MoreThanOrEqual(start_date),
            ...queryOptions,
          },
          order: { created_at: "ASC" },
          skip: offset,
          take: limit,
        })
        res_list = list
        res_count = count
      } else {
        const [list, count] = await getRepository(User).findAndCount({
          where: [
            { full_name: ILike(`%${value}%`), ...queryOptions },
            { handle: ILike(`%${value}%`), ...queryOptions },
          ],
          order: { full_name: "ASC" },
          skip: offset,
          take: limit,
        })

        res_list = list
        res_count = count
      }

      if (res_count > 0) {
        for (const res of res_list) {
          delete res?.email_verification
          delete res?.password
        }
      }
      results.result = res_list
      results.count = res_count
    } else if (field === searchFieldType.VERIFICATION) {
      queryOptions = {
        account_type: AccountType.CELEB,
      }
      let res_list = []
      let res_count = 0
      //by default filter is by name
      if (filter === "request") {
        const [list, count] = await getRepository(Influencer).findAndCount({
          where: {
            is_admin_verified: false,
            full_name: Like(`%${value}%`),
          },
          order: { created_at: "DESC" },
          skip: offset,
          take: limit,
        })
        res_list = list
        res_count = count
      } else if (filter === "date") {
        if (moment(value).isValid() === false) {
          return this.internalResponse(
            false,
            {},
            400,
            "Date must be in format YYYY-MM-DD"
          )
        }
        const start_date = moment(value).startOf("day")
        const [list, count] = await getRepository(User).findAndCount({
          where: {
            created_at: MoreThanOrEqual(start_date),
            ...queryOptions,
          },
          order: { created_at: "ASC" },
          skip: offset,
          take: limit,
        })
        res_list = list
        res_count = count
      } else {
        const [list, count] = await getRepository(User).findAndCount({
          where: [
            { full_name: Like(`%${value}%`), ...queryOptions },
            { handle: Like(`%${value}%`), ...queryOptions },
          ],
          order: { full_name: "ASC" },
          skip: offset,
          take: limit,
        })

        res_list = list
        res_count = count
      }

      if (res_count > 0) {
        for (const res of res_list) {
          delete res?.email_verification
          delete res?.password
        }
      }
      results.result = res_list
      results.count = res_count
    }

    if (results.result.length <= 0) {
      return this.internalResponse(false, {}, 400, "No results found")
    }

    return this.internalResponse(true, results, 200, "Results found")
  }
}

export const adminService = new AdminService()
