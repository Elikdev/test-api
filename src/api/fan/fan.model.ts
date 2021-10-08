import { ChildEntity, Column} from "typeorm";
import {User} from '../user/user.model'

@ChildEntity()
export class Fan extends User{
    
    @Column("simple-array")
    interests:string[]
}