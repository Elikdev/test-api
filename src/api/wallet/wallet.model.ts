import { Entity, Column, OneToOne } from "typeorm";
import { BaseModel } from "../../helpers/db.helper";



Entity()
export class Wallet extends BaseModel{

    @Column()
    wallet_balance:number

    @Column()
    ledger_balance:number

   
}