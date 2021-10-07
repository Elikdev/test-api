import { Entity, Column, OneToOne } from "typeorm";
import { BaseModel } from "../../helpers/db.helper";
import { Influencer } from "../influencer/influencer.model";



@Entity({name:'wallet'})
export class Wallet extends BaseModel{

    @Column()
    wallet_balance:number

    @Column()
    ledger_balance:number

    @OneToOne(()=>Influencer, influencer=>influencer.wallet)
    influencer:Influencer
}