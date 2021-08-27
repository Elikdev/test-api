import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AuthCredentials1630031955598 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "auth_cred",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isNullable: false,
                        isGenerated: true,
                    },
                    {
                        name: "OTP",
                        type: "varchar",
                    },
                    {
                        name: "blackListed",
                        type: "boolean",
                        default: false,
                    },

                    {
                        name: "issueTime",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                    },
                    {
                        name: "expTime",
                        type: "timestamp",
                    },
                    {
                        name: "receipient",
                        type: "varchar",
                    },
                    {
                        name: "userId",
                        type: "int",
                    },
                    {
                        name: "channel",
                        type: "enum",
                        enum: ["email", "sms"],
                        default: `'email'`,
                    },
                    {
                        name: "verified",
                        type: "boolean",
                        default: false,
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
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("auth_cred");
    }
}
