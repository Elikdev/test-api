import {Column, Entity, OneToOne, JoinColumn, ManyToMany, ManyToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { RequestStatus, RequestType, RequestDelivery } from '../../utils/enum';
import { Influencer } from '../influencer/influencer.model';
import { Transactions } from '../transactions/transaction.model';
import { User } from '../user/user.model';


@Entity({name:'requests'})
export class Requests extends BaseModel{

    @Column({
        enum:RequestType,
    })
    request_type:string

    @Column({
    enum:RequestDelivery,
    default:RequestDelivery.STANDARD
    })
    request_delivery:string


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