import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class messageTableUpdate1645369117965 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("messages", new TableColumn({
            name: "unique_msg_id",
            type: "varchar",
            isNullable: true
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("messages", "unique_msg_id")
    }

}
