import authRouter from "./api/auth/auth.controller";
import influencerRouter from "./api/influencer/influencer.controller";
import userRouter from "./api/user/user.controller";
import followRouter from "./api/follow/follow.controller";
import requestRouter from "./api/requests/request.controller";
import bankRouter from "./api/bank/bank.controller"
import walletRouter from "./api/wallet/wallet.controller"
import ratingRouter from "./api/ratings/ratings.controller"
import industryRouter from "./api/industry/industry.controller"
import transactionRouter from "./api/transactions/transaction.controller";
import tempRouter from "./api/temp/temp.controller";
import messageRouter from "./api/messages/messages.controller";
import adminRouter from "./api/admin/admin.controller";
import roomRouter from "./api/room/room.controller";

const apiPrefix = "/api/v1";

const routes = [
  {
    prefix: "auth",
    name: authRouter,
  },
  {
    prefix: "user",
    name: userRouter,
  },
  {
    prefix: "follower",
    name: followRouter
  },
  {
    prefix:"influencer",
    name:influencerRouter
  },
  {
    prefix:"request",
    name:requestRouter
  },
  {
    prefix: "bank",
    name: bankRouter,
  },
  {
    prefix: "wallet",
    name: walletRouter,
  },
  {
    prefix: "rating",
    name: ratingRouter,
  },
  {
    prefix: "industry",
    name: industryRouter,
  },
  {
    prefix: "temp",
    name: tempRouter
  },
  {
    prefix: "transaction",
    name: transactionRouter,
  }, 
  {
    prefix: "message",
    name: messageRouter,
  },
  {
    prefix: "admin",
    name: adminRouter,
  },
  {
    prefix: "room",
    name: roomRouter
  }
];

export default (app: any) => {
  routes.forEach((element) => {
    app.use(`${apiPrefix}/${element.prefix}`, element.name)
  })
  return app
}
