import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addAccountType1633657199690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "account_type",
            type: "varchar",
            isNullable: true,
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "account_type")
    }

}
