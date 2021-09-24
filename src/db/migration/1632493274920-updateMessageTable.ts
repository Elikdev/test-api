import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class updateMessageTable1632493274920 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "message",
            new TableColumn({
                name: "deleted",
                type: "boolean",
                default: false,
            })
        )

        await queryRunner.addColumn(
            "message",
            new TableColumn({
                name: "deleted_by",
                type: "varchar",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("message", "deleted")

        await queryRunner.dropColumn("message", "deleted_by")
    }
}
