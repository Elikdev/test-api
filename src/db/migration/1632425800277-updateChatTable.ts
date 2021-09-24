import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class updateChatTable1632425800277 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "chat",
            "user_1",
            new TableColumn({
                name: "user_1",
                type: "int",
                isNullable: false,
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "user_2",
            new TableColumn({
                name: "user_2",
                type: "int",
                isNullable: false,
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "blocked_at",
            new TableColumn({
                name: "blocked_at",
                type: "timestamp",
                isNullable: true,
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "open",
            new TableColumn({
                name: "open",
                type: "boolean",
                default: false,
            })
        )

        await queryRunner.addColumn(
            "chat",
            new TableColumn({
                name: "archived",
                type: "boolean",
                default: false,
            })
        )

        await queryRunner.addColumn(
            "chat",
            new TableColumn({
                name: "archived_by",
                type: "varchar",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "chat",
            "user_1",
            new TableColumn({
                name: "user_1",
                type: "int",
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "user_2",
            new TableColumn({
                name: "user_2",
                type: "int",
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "blocked_at",
            new TableColumn({
                name: "blocked_at",
                type: "timestamp",
            })
        )

        await queryRunner.changeColumn(
            "chat",
            "open",
            new TableColumn({
                name: "open",
                type: "boolean",
            })
        )

        await queryRunner.dropColumn("chat", "archived")

        await queryRunner.dropColumn("chat", "archived_by")
    }
}
