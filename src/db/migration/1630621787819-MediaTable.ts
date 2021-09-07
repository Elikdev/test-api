import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableColumn,
} from "typeorm";

export class MediaTable1630621787819 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "media",
                columns: [
                    {
                        name: "id",
                        isPrimary: true,
                        type: "int",
                        isGenerated: true,
                    },
                    {
                        name: "url",
                        type: "varchar",
                    },
                    {
                        name: "user_id",
                        type: "int",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["image", "video"],
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
        )

        await queryRunner.addColumn(
            "media",
            new TableColumn({
                name: "postId",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKeys("media", [
            new TableForeignKey({
                columnNames: ["postId"],
                referencedColumnNames: ["id"],
                referencedTableName: "post",
                onDelete: "CASCADE",
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("media");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("postId") !== -1
        );
        await queryRunner.dropForeignKey("media", foreignKey);
        await queryRunner.dropColumn("media", "userId");
        await queryRunner.dropTable("media");
    }
}
