import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { BaseModel } from "../../helpers/db.helper"
import {AdminCategory} from "../../utils/enum"


@Entity({ name: "bank" })
export class Admin extends BaseModel {
 @Column()
 name: string

 @Column()
 email: string

 @Column({
  type: "enum",
  enum: AdminCategory,
  default: AdminCategory.SUPER_ADMIN
 })
 admin_category: AdminCategory

 @Column({type: "json"})
 permissions: []
}