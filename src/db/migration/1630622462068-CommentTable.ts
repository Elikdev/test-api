import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableColumn,
} from "typeorm";

export class CommentTable1630622462068 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "comment",
                columns: [
                    {
                        name: "id",
                        isPrimary: true,
                        type: "int",
                        isGenerated: true,
                    },
                    {
                        name: "content",
                        type: "varchar",
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

        await queryRunner.addColumn(
            "comment",
            new TableColumn({
                name: "postId",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "comment",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true,
            })
        );
        await queryRunner.createForeignKeys("comment", [
            new TableForeignKey({
                columnNames: ["postId"],
                referencedColumnNames: ["id"],
                referencedTableName: "post",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("comment");
        const foreignKey = table.foreignKeys.filter((fk) => {
            if (fk.columnNames.includes("postId")) {
                return fk;
            }

            if (fk.columnNames.includes("userId")) {
                return fk;
            }
        });
        await queryRunner.dropForeignKeys("media", foreignKey);
        await queryRunner.dropColumn("media", "postId");
        await queryRunner.dropColumn("media", "userId");
        await queryRunner.dropTable("media");
    }
}
