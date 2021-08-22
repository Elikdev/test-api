import { Column, CreateDateColumn, Entity,  ManyToOne,  PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Industries } from "../../enums";
import { User } from "../User/user.model";


@Entity({ name: 'interest' })
export class Interest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'json'})
    industries: Industries

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;
}