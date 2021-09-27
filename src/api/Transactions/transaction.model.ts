import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { DebitDetails, TransactionStatus, TransactionType } from "../../enums";
import { User } from "../User/user.model";
import { Wallet } from "../Wallet/wallet.model";
import { ActivitiesRequest } from "../User/activityRequest.model";


@Entity({ name: "transaction" })
export class Transactions {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.transactions)
    user: User

    @Column({ type: "decimal", nullable: false })
    amount: number

    @Column()
    narration: string

    @Column({ type: "enum", enum: TransactionType })
    type: TransactionType

    @OneToOne(()=>ActivitiesRequest)
    request: ActivitiesRequest

    @Column({default:null, nullable:true})
    credited_by: number

    @Column({ type: "json", default:null, nullable:true })
    debited_to: DebitDetails

    @Column({nullable:false})
    reference: string
    // meta details about the transactio:
    @Column({ type: "json" })
    meta: any

    @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus

    @ManyToOne(() => Wallet, u => u.transactions)
    wallet: Wallet

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    updated_at: Date;
}