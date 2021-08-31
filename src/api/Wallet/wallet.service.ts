import { BaseService } from "../../enums";
import { Wallet } from "./wallet.model";

class WalletServices extends BaseService {
    async getWallet(user_id: number) {
        const wallet = await this.findOne(Wallet, {
            where: {
                user: user_id
            },
        })
        return this.internalResponse(true, wallet, 200, 'success')
    }
}


export const walletServices = new WalletServices()