import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import { AdminCategory } from "../../utils/enum";

export class adminTable1640556211023 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "admin_category",
            type: "enum",
            enum: [AdminCategory.SUB_ADMIN, AdminCategory.SUPER_ADMIN],
            isNullable: true
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "permissions",
            type: "json",
            isNullable: true
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "blocked",
            type: "boolean",
            default: false
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "deleted",
            type: "boolean",
            default: false
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "admin_category")
        await queryRunner.dropColumn("users", "permissions")
        await queryRunner.dropColumn("users", "blocked")
        await queryRunner.dropColumn("users", "deleted")
    }

}
