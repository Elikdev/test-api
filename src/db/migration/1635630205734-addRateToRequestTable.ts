import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addRateToRequestTable1635630205734 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "requests",
            new TableColumn({
              name: "rate",
              type: "varchar",
              isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("requests", "rate")
    }

}
