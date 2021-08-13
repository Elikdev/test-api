import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index} from "typeorm";
import {AccountStatus, Gender} from "../../enums"
@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({nullable:false})
    password: string

    @Index({unique: true})
    @Column({ nullable: false})
    username: string

    @Column()
    profile_pic: string

    @Column()
    descriptions: string

    @Column({ default : "pending" })
    acount_type: ["fan", "admin", "user"]

    @Column({default:AccountStatus.PENDING, type: "enum" })
    status: AccountStatus

    @Column({nullable: false, type: "enum", enum: Gender, default: Gender.UNKNOWN })
    sex: Gender

    @Column({ type: "date"})
    date_of_birth:string

    @Column()
    profile_wallpaper:string

    @Index({unique: true})
    @Column({ unique: true, nullable:false })
    email:string

    @Column( { type: 'timestamptz' })
    last_seen : Date

    @Column({default:0})
    followers_count: number

    @Column({default:0})
    following_count: number

    @Column({default:0})
    posts_count: number

    @Column()
    location: string

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}