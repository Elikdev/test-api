import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Transaction, UpdateDateColumn } from "typeorm";
import { Transactions } from "../Transactions/transaction.model";
import { User } from "../User/user.model";


@Entity({ name: 'wallet' })
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column({ type: "decimal" })
    balance: number
    default: 0.00

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @OneToMany( () => Transactions, (t) => t.wallet)
    transactions: Transactions[]
}