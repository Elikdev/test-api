import { BaseService } from "../../helpers/db.helper";
import {Wallet} from './wallet.model'
import {Influencer} from '../influencer/influencer.model'


class WalletService extends BaseService {
    super:any

    public newWalletInstance(celeb:Influencer){
        const celeb_wallet = new Wallet()
        celeb_wallet.wallet_balance = 0
        celeb_wallet.ledger_balance = 0
        celeb_wallet.influencer = celeb
        return celeb_wallet
    }
    
    public async createWallet(user:Influencer){
        const wallet = await this.create(Wallet, {
            wallet_balance: 0,
            ledger_balance: 0,
            influencer: user
         })

         await this.save(Wallet, wallet)
    }
}

export const walletService = new WalletService