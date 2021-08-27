import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ChannelType } from "../../enums";

@Entity({ name: "auth_cred" })
export class Auth_cred {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    OTP: string;

    @Column({ default: false })
    blackListed: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    issueTime: Date;

    @Column()
    expTime: Date;

    @Column()
    receipient: string;

    @Column()
    userId: number;

    @Column({ default: ChannelType.EMAIL, type: "enum", enum: ChannelType })
    channel: ChannelType;

    @Column({ default: false })
    verified: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;
   
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;
}
