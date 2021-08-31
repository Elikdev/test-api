import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DebitDetails, TransactionStatus, TransactionType } from "../../enums";
import { User } from "../User/user.model";
import { Wallet } from "../Wallet/wallet.model";


@Entity({ name: "transaction" })
export class Transactions {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.transactions)
    user: User

    @Column({ type: "decimal" })
    amount: number

    @Column()
    narration: string

    @Column({ type: "enum", enum: TransactionType })
    type: TransactionType


    @Column()
    credited_by: number

    @Column({ type: "json" })
    debited_to: DebitDetails

    @Column()
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