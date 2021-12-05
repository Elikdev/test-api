import {Column, Entity, OneToOne, JoinColumn, ManyToMany, ManyToOne} from 'typeorm'
import { BaseModel } from '../../helpers/db.helper';
import { RequestStatus, RequestType, RequestDelivery } from '../../utils/enum';
import { Fan } from '../fan/fan.model';
import { Influencer } from '../influencer/influencer.model';
import { Transactions } from '../transactions/transaction.model';
import { User } from '../user/user.model';
import { Requests } from  "./request.model"


@Entity({name:'shout-out-videos'})
export class ShoutOutVideos extends BaseModel{
 @Column()
 video_url: string

 @ManyToOne(() => Requests)
 @JoinColumn()
 request: Requests 

 @ManyToOne(() => Fan)
 @JoinColumn()
 fan: Fan

 @ManyToOne(() => Influencer)
 @JoinColumn()
 influencer: Influencer

}