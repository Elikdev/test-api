import { Column, Entity, ChildEntity, ManyToOne, JoinColumn, ColumnTypeUndefinedError } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import {AdminCategory} from "../../utils/enum"
import { User } from "../user/user.model"


@ChildEntity()
export class Admin extends User {
 @Column({
  type: "enum",
  enum: AdminCategory
 })
 admin_category: AdminCategory

 @Column({type: "json"})
 permissions: string[]

 @Column({ default: false })
 blocked: boolean

 @Column({ default: false })
 deleted: boolean
}