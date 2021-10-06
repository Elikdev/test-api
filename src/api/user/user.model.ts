import {Column, Entity, OneToMany, TableInheritance} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { Transactions } from '../transactions/transactions.model';


@Entity()
@TableInheritance({column:{type: "varchar",name:"type"}})
export class User extends BaseModel {

    @Column()
    full_name:string

    @Column({unique:true})
    handle:string

    @Column({unique:true})
    email:string

    @Column()
    password:string

    @Column({unique:true})
    phone_number:number

    @Column()
    country_code:number

    @Column()
    is_verified:false

    @Column()
    profile_image:string

    @OneToMany(()=>Transactions, transaction=>transaction.user)
    transactions:Transactions[]

}