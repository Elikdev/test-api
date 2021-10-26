import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
// import { User } from "../user/user.model"
import { Industries } from "../../utils/enum"

@Entity({ name: "industry" })
export class Industry extends BaseModel {
  @Column({type: 'json'})
  industries: Industries
}
