import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class setupOtp1633614298180 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "email_verification",
            type: "jsonb",
            isNullable: true
        }))

        await queryRunner.addColumn("users",  new TableColumn({
            name: "email_verified",
            type: "boolean",
            default: false
        }))

        await queryRunner.addColumn("users",  new TableColumn({
            name: "last_login",
            type: "timestamp",
            isNullable: true
        }))
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "email_verification")
        await queryRunner.dropColumn("users", "email_verified")
        await queryRunner.dropColumn("users", "last_login")
    }

}
