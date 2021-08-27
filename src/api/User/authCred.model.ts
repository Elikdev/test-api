import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ChannelType } from "../../enums";

@Entity({ name: "auth_cred" })
export class Auth_cred {
 @PrimaryGeneratedColumn()
 id: number;

 @Column()
 OTP: string;

 @Column({ default: false })
 blackListed: boolean;

 @Column({ default: () => "CURRENT_TIMESTAMP(6)" })
 issueTime: Date;

 @Column()
 expTime: Date;

 @Column()
 receipient: string;

 @Column({ default: ChannelType.EMAIL, type: "enum", enum: ChannelType })
 channel: ChannelType;

 @Column({ default: false })
 verified: boolean;
}
