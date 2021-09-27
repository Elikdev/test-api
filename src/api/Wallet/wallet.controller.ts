/* eslint-disable @typescript-eslint/no-empty-function */
import {Request, Response} from 'express'
import { errorResponse, successRes } from "../../utils/response";
import { walletServices } from "./wallet.service"


class WalletControllers {
    public async getWallet(req:Request, res:Response) {
        try {
            const authUser = (req as any).user;
            const response = await walletServices.getWallet(authUser.id)
            if (!response.status) {
                return errorResponse(res, response.message, response.statusCode);
            }
            return successRes(res, response.data, response.message, response.statusCode)
        } catch (error) {
            console.log(error);
            return errorResponse(res, "an error occured contact support", 500);
        }
    }

    public async deposit(req:Request, res:Response) {
        
    }

    public async withdrawal(req:Request, res:Response) {

    }

    public async transactions(req:Request, res:Response) {

    }
}


export const walletController = new WalletControllers()