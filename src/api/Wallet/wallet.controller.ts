/* eslint-disable @typescript-eslint/no-empty-function */

import { errorResponse, successRes } from "../../utils/response";
import { walletServices } from "./wallet.service"


class WalletControllers {
    public async getWallet(req, res) {
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

    public async deposit(req, res) {
        
    }

    public async withdrawal(req, res) {

    }

    public async transactions(req, res) {

    }
}


export const walletcontroller = new WalletControllers()