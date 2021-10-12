import { Router } from "express";
import authRouter from "./api/auth/auth.controller";
import influencerRouter from "./api/influencer/influencer.controller";
import userRouter from "./api/user/user.controller";
import followRouter from "./api/follow/follow.controller";
const apiPrefix: string = "/api/v1";

const routes = [
  {
    prefix: "auth",
    name: authRouter,
  },
  {
    prefix: "user",
    name: userRouter
  },
  {
    prefix: "follower",
    name: followRouter
  },{
    prefix:"influencer",
    name:influencerRouter
  }
];

export default (app: any) => {
  routes.forEach((element) => {
    app.use(`${apiPrefix}/${element.prefix}`, element.name);
  });
  return app;
};
