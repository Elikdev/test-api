import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addExpressFee1643799413990 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("settings", new TableColumn({
            name: "express_delivery_fee",
            type: "float",
            isNullable: true
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("settings", "express_delivery_fee")
    }

}
