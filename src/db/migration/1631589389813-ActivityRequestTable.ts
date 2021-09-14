import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class ActivityRequestTable1631589389813 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "activities_request",
                columns: [
                    {
                        name: "id",
                        isGenerated: true,
                        type: "int",
                        isPrimary: true,
                        isNullable: false,
                    },

                    {
                        name: "user_id",
                        type: "int",
                    },

                    {
                        name: "celeb_id",
                        type: "int",
                    },
                    {
                        name: "payment_ref",
                        type: "varchar",
                    },
                    {
                        name: "amount",
                        type: "varchar",
                    },
                    {
                        name: "celeb_done",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "user_done",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "meta",
                        type: "json",
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("activities_request")
    }
}
