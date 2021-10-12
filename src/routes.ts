import { Router } from "express";
import authRouter from "./api/auth/auth.controller";
import userRouter from "./api/user/user.controller";
import bankRouter from "./api/bank/bank.controller"
const apiPrefix: string = "/api/v1";

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
    prefix: "bank",
    name: bankRouter,
  },
]

export default (app: any) => {
  routes.forEach((element) => {
    app.use(`${apiPrefix}/${element.prefix}`, element.name);
  });
  return app;
};
