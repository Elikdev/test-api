import {Column, Entity, OneToOne, JoinColumn, ManyToMany} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { RequestStatus } from '../../utils/enum';
import { Transactions } from '../transactions/transaction.model';
import { User } from '../user/user.model';


@Entity({name:'requests'})
export class Requests extends BaseModel{

    @Column()
    purpose:string;

    @Column({
        enum:RequestStatus,
        default:RequestStatus.PENDING
    })
    status:string

    @Column({default:'none'})
    reason:string

    @OneToOne(()=>Transactions, transaction=>transaction.request)
    @JoinColumn()
    transaction:Transactions

    @ManyToMany(()=>User, user=>user.requests)
    users:User[]
    
}