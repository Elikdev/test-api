import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
    TableColumn,
} from "typeorm";

export class PostTable1630620474096 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "post",
                columns: [
                    {
                        name: "id",
                        isPrimary: true,
                        type: "int",
                        isGenerated: true,
                    },
                    {
                        name: "title",
                        type: "varchar",
                    },
                    {
                        name: "content",
                        type: "varchar",
                    },
                    {
                        name: "short_url",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                        onUpdate: "CURRENT_TIMESTAMP(6)",
                    },
                ],
            }),
            true
        );

        await queryRunner.createIndex(
            "post",
            new TableIndex({
                name: "short_url",
                columnNames: ["short_url"],
            })
        );

        await queryRunner.addColumn(
            "post",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKeys("post", [
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("post");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("userId") !== -1
        );
        await queryRunner.dropForeignKey("post", foreignKey);
        await queryRunner.dropColumn("post", "userId");
        await queryRunner.dropTable("post");
    }
}
