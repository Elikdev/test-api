import {Column, Entity, OneToOne, ManyToOne, JoinColumn} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { RequestStatus } from '../../utils/enum';
import { Transactions } from '../transactions/transactions.model';


@Entity()
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

    // @ManyToOne(()=>User, user=>user.transactions)
    // fan:User

    // @ManyToOne(()=>User, user=>user.transactions)
    // influencer:User
    
}