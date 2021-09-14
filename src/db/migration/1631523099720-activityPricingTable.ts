import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableColumn,
} from "typeorm"

export class activityPricingTable1631523099720 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "activities_pricing",
                columns: [
                    {
                        name: "id",
                        isGenerated: true,
                        type: "int",
                        isPrimary: true,
                        isNullable: false,
                    },

                    {
                        name: "message",
                        type: "varchar",
                    },

                    {
                        name: "picture",
                        type: "varchar",
                    },
                    {
                        name: "video",
                        type: "varchar",
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
                    },
                ],
            }),
            true
        )

        await queryRunner.addColumn(
            "activities_pricing",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true,
            })
        )

        await queryRunner.createForeignKeys("activities_pricing", [
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("activities_pricing")
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("userId") !== -1
        )
        await queryRunner.dropForeignKey("activities_pricing", foreignKey)
        await queryRunner.dropColumn("activities_pricing", "userId")
        await queryRunner.dropTable("activities_pricing")
    }
}
