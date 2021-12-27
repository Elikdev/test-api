import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class settingsTable1640203872761 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "settings",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isGenerated: true,
                        isNullable: false,
                        isPrimary: true,
                      },
                    {
                        name: "transaction_fee",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "standard_delivery_time",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "express_delivery_time",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                      },
                      {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                        onUpdate: "CURRENT_TIMESTAMP(6)",
                      }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("settings")
    }

}
