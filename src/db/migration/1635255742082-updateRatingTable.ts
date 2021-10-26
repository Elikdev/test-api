import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import {RequestType} from "../../utils/enum"

export class updateRatingTable1635255742082 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("ratings", new TableColumn({
            name: "request_type",
            type: "enum",
            enum: [RequestType.DM, RequestType.SHOUT_OUT],
            isNullable: true
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "average_dm_rating",
            type: "varchar",
            isNullable: true,
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "average_shout_out_rating",
            type: "varchar",
            isNullable: true,
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("ratings", "request_type")
        await queryRunner.dropColumn("users", "average_shout_out_rating")
        await queryRunner.dropColumn("users", "average_dm_rating")
    }

}
