import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm"

export class bankTable1634038666559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "bank",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isNullable: false,
            isGenerated: true,
          },
          {
            name: "account_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "account_number",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "bank_name",
            type: "varchar",
            isNullable: false,
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

    await queryRunner.createIndex(
      "bank",
      new TableIndex({
        name: "account_number",
        columnNames: ["account_number"],
      })
    )

    await queryRunner.addColumn(
      "bank",
      new TableColumn({
        name: "userId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "bank",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("bank")
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("userId") !== -1
    )
    await queryRunner.dropForeignKey("bank", foreignKey)
    await queryRunner.dropColumn("bank", "userId")
    await queryRunner.dropTable("bank")
  }
}
