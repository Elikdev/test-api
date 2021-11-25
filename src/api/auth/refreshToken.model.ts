import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import {User} from '../user/user.model'

@Entity({name: "refresh-tokens"})
export class RefreshToken extends BaseModel {
 @Column()
 token: string

 @Column()
 expires_in: Date

 @OneToOne(() => User, user => user.refresh_token)
 @JoinColumn()
 user: User
}