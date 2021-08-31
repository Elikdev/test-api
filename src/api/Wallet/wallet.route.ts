import { Router } from "express";
import { AuthModule } from "../../utils/auth";
import { walletcontroller } from "./wallet.controller";

const route = Router()

route.get('/', AuthModule.isAuthenticatedUser, walletcontroller.getWallet)

route.post('/deposit', AuthModule.isAuthenticatedUser)

route.post('/withdrawal', AuthModule.isAuthenticatedUser)

route.get('/transactions', AuthModule.isAuthenticatedUser)

export default route;