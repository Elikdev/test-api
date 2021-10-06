import {Column, Entity, ManyToOne, OneToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { TransactionType } from '../../utils/enum';
import { Requests } from '../requests/request.model';
import {User} from '../User/user.model'


@Entity()
export class Transactions extends BaseModel{

    @Column({
        enum:TransactionType,
        default:TransactionType.CREDIT
    })
    type:string

    @Column()
    description:string;

    @Column()
    amount:number

    @OneToOne(()=>Requests, request=>request.transaction)
    request:Requests

    @ManyToOne(()=>User, user=>user.transactions)
    user:User
}