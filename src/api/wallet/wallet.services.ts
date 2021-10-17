import { BaseService } from "../../helpers/db.helper";
import {Wallet} from './wallet.model'
import {Influencer} from '../influencer/influencer.model'
import { User } from "../user/user.model"
import { DeepPartial } from "typeorm";


class WalletService extends BaseService {
  super: any

  public newWalletInstance(user: User) {
    const user_wallet = new Wallet()
    user_wallet.wallet_balance = 0
    user_wallet.ledger_balance = 0
    user_wallet.user = user
    return user_wallet
  }

  public async saveWallet(wallet: Wallet) {
    return await this.save(Wallet, wallet)
  }

  public async findWalletByUserId(id: number) {
    return await this.findOne(Wallet, {
      where: { user: id },
    })
  }

  public async updateWallet(
    walletToUpdate: Wallet,
    updateFields: DeepPartial<Wallet>
  ) {
    this.schema(Wallet).merge(walletToUpdate, updateFields)
    return await this.updateOne(Wallet, walletToUpdate)
  }
}

export const walletService = new WalletService