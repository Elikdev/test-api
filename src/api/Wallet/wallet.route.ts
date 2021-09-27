import { Router } from "express";
import { AuthModule } from "../../utils/auth";
import { walletController } from "./wallet.controller";

const route = Router()

route.get('/', AuthModule.isAuthenticatedUser, walletController.getWallet)

route.post('/withdrawal', AuthModule.isAuthenticatedUser)

route.get('/transactions', AuthModule.isAuthenticatedUser)

export default route;