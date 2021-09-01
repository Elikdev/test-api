import { celebrate } from "celebrate";
import { query, Router } from "express";
import Joi from "joi";
import { AccountType, Gender } from "../../enums";
import { AuthModule } from "../../utils/auth";
import {userController} from "./user.controller";
import { paymentDetailsController } from "../Payment/payment.controller";


const userRouter = Router()

userRouter.route('/sign-up')
    // sign up
    .post( 
        celebrate({
            body: Joi.object({
                account_type: Joi.valid(AccountType.FAN, AccountType.CELEB, AccountType.ADMIN).required(),
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
                email: Joi.string().email().required(),
                phone: Joi.string().required(),
                user_name: Joi.string().required(),
                password: Joi.string().required()
            })
        }),
        userController.signUp
    )

userRouter.route('/login')
    .post(celebrate({
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    }),
    userController.signIn
)

userRouter.route("/forgot-password").post(
    celebrate({
        body: Joi.object({
            email: Joi.string().email().required(),
        }),
    }),
    userController.forgotPassword
);

userRouter.route("/forgot-password/verify-otp").post(
    celebrate({
        body: Joi.object({
            email: Joi.string().email().required(),
            otp_code: Joi.string().required(),
        }),
    }),
    userController.verifyOtp
);

userRouter.route("/forgot-password/reset-password").post(
    celebrate({
        body: Joi.object({
            new_password: Joi.string().required(),
        }),
        query: Joi.object({
            token: Joi.string().required(),
        }),
    }),
    userController.resetPassword
);

userRouter.route("/update-profile").post(
 AuthModule.isAuthenticatedUser,
 celebrate({
  body: Joi.object({
   first_name: Joi.string().optional(),
   last_name: Joi.string().optional(),
   descriptions: Joi.string().optional(),
   location: Joi.string().optional(),
   date_of_birth: Joi.date().optional(),
   sex: Joi.valid(Gender.MALE, Gender.FEMALE, Gender.UNKNOWN).optional(),
  }),
 }),
 userController.updateProfile
);

userRouter
 .route("/payment-details")
 .get(
  AuthModule.isAuthenticatedUser,
  paymentDetailsController.getPaymentDetails
 );

userRouter.route("/update-payment-details").post(
    AuthModule.isAuthenticatedUser,
    celebrate({
        body: Joi.object({
            account_name: Joi.string().required(),
            account_number: Joi.string().length(10).required(),
            bank_code: Joi.string().length(3).required(),
            frequency: Joi.number().required(),
            interval: Joi.string().required(),
            frequency_amount: Joi.string().required(),
        }),
    }),
    paymentDetailsController.addPaymentDetails
);


export { userRouter }