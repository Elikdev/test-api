import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class chatTable1631511869889 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "chat",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                    },

                    {
                        name: "slug",
                        type: "varchar",
                        isUnique: true,
                    },

                    {
                        name: "user_1",
                        type: "int",
                    },
                    {
                        name: "user_2",
                        type: "int",
                    },
                    {
                        name: "blocked",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "blocked_at",
                        type: "timestamp",
                    },
                    {
                        name: "open",
                        type: "boolean",
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

        await queryRunner.createIndex(
            "chat",
            new TableIndex({
                name: "slug",
                columnNames: ["slug"],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("chat")
    }
}
