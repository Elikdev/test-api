import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm"

export class updateWalletTable1634332553769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "walletId")

    await queryRunner.addColumn(
      "wallet",
      new TableColumn({
        name: "userId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "wallet",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "walletId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.dropColumn("wallet", "userId")

    await queryRunner.dropForeignKey("wallet", "walletId")
  }
}
