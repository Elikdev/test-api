import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableForeignKey,
} from "typeorm"

export class MessageTable1631511907893 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "message",
                columns: [
                    {
                        name: "id",
                        isGenerated: true,
                        type: 'int',
                        isPrimary: true,
                        isNullable: false
                    },

                    {
                        name: "content",
                        type: "varchar",
                    },

                    {
                        name: "type",
                        type: "varchar",
                    },
                    {
                        name: "sender_id",
                        type: "int",
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
            "message",
            new TableColumn({
                name: "chatId",
                type: "int",
                isNullable: true,
            })
        )

        await queryRunner.createForeignKeys("message", [
            new TableForeignKey({
                columnNames: ["chatId"],
                referencedColumnNames: ["id"],
                referencedTableName: "chat",
                onDelete: "CASCADE",
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("message")
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("chatId") !== -1
        )
        await queryRunner.dropForeignKey("message", foreignKey)
        await queryRunner.dropColumn("message", "chatId")
        await queryRunner.dropTable("message")
    }
}
