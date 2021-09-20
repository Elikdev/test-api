import {
 Column,
 CreateDateColumn,
 Entity,
 Index,
 OneToOne,
 JoinColumn,
 PrimaryGeneratedColumn,
 UpdateDateColumn,
} from "typeorm";
import { User } from "../User/user.model";
import { PaymentInterval } from "../../enums";

@Entity({ name: "payment_detail" })
export class Payment_detail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    accountName: string;

    @Index({ unique: true })
    @Column({ nullable: false })
    accountNumber: string;

    @Column({ nullable: false })
    bankCode: string;

    @Column({ nullable: false })
    frequency: number;

    @Column({ type: "enum", enum: PaymentInterval })
    interval: PaymentInterval;

    @Column({ nullable: false })
    frequencyAmount: string;

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

    @OneToOne(() => User, (user) => user.payment_details)
    @JoinColumn()
    user: User;
}
