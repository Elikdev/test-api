import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addStatusField1633654045297 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "status",
            type: "enum",
            enum: ["disabled", "active"],
            default: `'active'`,
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "last_login",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP(6)",
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "status")
        await queryRunner.dropColumn("users", "last_login")
    }

}
