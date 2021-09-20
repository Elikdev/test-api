import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableColumn,
} from "typeorm";

export class LikeTable1630623442198 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "like",
                columns: [
                    {
                        name: "id",
                        isPrimary: true,
                        type: "int",
                        isGenerated: true,
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
            "like",
            new TableColumn({
                name: "postId",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "like",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true,
            })
        );
        await queryRunner.createForeignKeys("like", [
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
        const table = await queryRunner.getTable("like");
        const foreignKey = table.foreignKeys.filter((fk) => {
            if (fk.columnNames.includes("postId")) {
                return fk;
            }

            if (fk.columnNames.includes("userId")) {
                return fk;
            }
        });
        await queryRunner.dropForeignKeys("like", foreignKey);
        await queryRunner.dropColumn("like", "postId");
        await queryRunner.dropColumn("like", "userId");
        await queryRunner.dropTable("like");
    }
}
