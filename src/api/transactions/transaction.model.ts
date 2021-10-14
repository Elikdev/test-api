import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { TransactionType, TransactionStatus } from '../../utils/enum';
import { Requests } from '../requests/request.model';
import {User} from '../user/user.model'


@Entity({name:'transactions'})
export class Transactions extends BaseModel{

    @Column({
        enum:TransactionType,
        default:TransactionType.CREDIT
    })
    type:string

    @Column()
    description:string;

    @Column({
        enum:TransactionStatus,
        default:TransactionStatus.PENDING
    })
    status:string

    @Column()
    transaction_reference:string

    @Column()
    transaction_id:string

    @Column()
    amount:number

    @OneToOne(()=>Requests, request=>request.transaction)
    request:Requests

    @ManyToOne(() => User, (user) => user.transactions, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;
}