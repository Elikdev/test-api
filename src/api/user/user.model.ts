import {Column, Entity, OneToMany, TableInheritance, ManyToMany, JoinTable} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { Transactions } from '../transactions/transaction.model';
import { Requests } from "../requests/request.model";

@Entity({name:'users'})
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

    @Column({nullable:true})
    profile_image:string

    @OneToMany(()=>Transactions, transaction=>transaction.user)
    transactions:Transactions[]

    @ManyToMany(()=>Requests, requests=>requests.users)
    @JoinTable()
    requests:Requests[]

}