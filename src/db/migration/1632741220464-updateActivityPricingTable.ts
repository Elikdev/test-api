import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateActivityPricingTable1632741220464 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("activities_pricing", "message", new TableColumn({
            name: "message",
            type: "float",
            isNullable: true
        }))

        await queryRunner.changeColumn("activities_pricing", "picture", new TableColumn({
            name: "picture",
            type: "float",
            isNullable: true
        }))

        await queryRunner.changeColumn("activities_pricing", "video", new TableColumn({
            name: "video",
            type: "float",
            isNullable: true
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("activities_pricing", "message", new TableColumn({
            name: "message",
            type: "varchar",
            isNullable: true
        }))

        await queryRunner.changeColumn("activities_pricing", "picture", new TableColumn({
            name: "picture",
            type: "varchar",
            isNullable: true
        }))

        await queryRunner.changeColumn("activities_pricing", "video", new TableColumn({
            name: "video",
            type: "varchar",
            isNullable: true
        }))
    }

}
