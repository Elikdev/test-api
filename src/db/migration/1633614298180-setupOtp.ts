import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class setupOtp1633614298180 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "email_verification",
            type: "jsonb",
            isNullable: true
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "email_verification")
    }

}
