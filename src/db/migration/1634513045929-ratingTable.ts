import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm"

export class ratingTable1634513045929 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "ratings",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "rating",
            type: "float",
          },
          {
            name: "review_message",
            type: "text",
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
      }),
      true
    )

    await queryRunner.addColumn(
      "ratings",
      new TableColumn({
        name: "userId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      "ratings",
      new TableColumn({
        name: "influencerId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "ratings",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )

    await queryRunner.createForeignKey(
      "ratings",
      new TableForeignKey({
        columnNames: ["influencerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("ratings")
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("userId") !== -1
    )
    await queryRunner.dropForeignKey("ratings", foreignKey)
    await queryRunner.dropColumn("ratings", "userId")
    await queryRunner.dropColumn("ratings", "influencerId")
    await queryRunner.dropTable("ratings")
  }
}
