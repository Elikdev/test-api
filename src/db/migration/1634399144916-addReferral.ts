import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class addReferral1634399144916 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "referral_code",
        type: "varchar",
        isNullable: true,
        isUnique: true,
      })
    )

    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "referral_count",
        type: "int",
        default: 0,
        isNullable: true
      })
    )

    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "referred_by",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.changeColumn("wallet", "wallet_balance", new TableColumn({
      name: "wallet_balance",
      type: "float",
      isNullable: true,
      default: 0.00
    }))

    await queryRunner.changeColumn("wallet", "ledger_balance", new TableColumn({
      name: "ledger_balance",
      type: "float",
      isNullable: true,
      default: 0.00
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "referral_code")
    await queryRunner.dropColumn("users", "referral_count")
    await queryRunner.dropColumn("users", "referred_by")
    await queryRunner.changeColumn("wallet", "wallet_balance", new TableColumn({
      name: "wallet_balance",
      type: "int",
    }))

    await queryRunner.changeColumn("wallet", "ledger_balance", new TableColumn({
      name: "ledger_balance",
      type: "int",
    }))
  }
}
