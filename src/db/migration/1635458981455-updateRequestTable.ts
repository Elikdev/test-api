import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateRequestTable1635458981455 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "requests",
            new TableColumn({
              name: "fan_introduction",
              type: "varchar",
              isNullable: true,
            })
        )

        await queryRunner.addColumn(
            "requests",
            new TableColumn({
              name: "shoutout_message",
              type: "varchar",
              isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("requests", "fan_introduction")
        await queryRunner.dropColumn("requests", "shoutout_message")
    }

}
