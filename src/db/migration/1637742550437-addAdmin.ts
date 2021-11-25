import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm"

export class addAdmin1637742550437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "refresh-tokens",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "token",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "expires_in",
            type: "timestamp",
            isNullable: true,
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
      })
    )

    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "role",
        type: "enum",
        enum: ['BAMIKI_ADMIN', 'BAMIKI_USER'],
        default: `'BAMIKI_USER'`,
      })
    )

    await queryRunner.addColumn(
      "refresh-tokens",
      new TableColumn({
        name: "userId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "refresh-tokens",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("refresh-tokens")
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("userId") !== -1
    )
    await queryRunner.dropForeignKey("refresh-tokens", foreignKey)
    await queryRunner.dropColumn("refresh-tokens", "userId")
    await queryRunner.dropTable("refresh-tokens")
    await queryRunner.dropColumn("users", "role")
  }
}
