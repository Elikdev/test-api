import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateWalletBalanceType1634743443932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("wallet", "wallet_balance", new TableColumn({
            name: "wallet_balance", 
            type: "varchar",
            isNullable: true,
        }))

        await queryRunner.changeColumn("wallet", "ledger_balance", new TableColumn({
            name: "ledger_balance", 
            type: "varchar",
            isNullable: true,
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("wallet", "wallet_balance", new TableColumn({
            name: "wallet_balance", 
            type: "varchar",
            isNullable: true,
        }))

        await queryRunner.changeColumn("wallet", "ledger_balance", new TableColumn({
            name: "ledger_balance", 
            type: "varchar",
            isNullable: true,
        }))
    }

}
