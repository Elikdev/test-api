import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateInfluencerTable1644921281302 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "withdrawal_verification",
            type: "jsonb",
            isNullable: true
        }))

        await queryRunner.addColumn("bank", new TableColumn({
            name: "bank_code",
            type: "varchar",
            isNullable: true
        }))

        await queryRunner.addColumn("users", new TableColumn({
            name: "transaction_pin",
            type: "varchar",
            isNullable: true
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "withdrawal_verification")
        await queryRunner.dropColumn("bank", "bank_code")
        await queryRunner.dropColumn("users", "transaction_pin")
    }
}
