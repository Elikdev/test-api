import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm"

export class shoutOutVideoTable1638727334706 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "shout-out-videos",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "video_url",
            type: "varchar",
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
      "shout-out-videos",
      new TableColumn({
        name: "requestId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      "shout-out-videos",
      new TableColumn({
        name: "fanId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      "shout-out-videos",
      new TableColumn({
        name: "influencerId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "shout-out-videos",
      new TableForeignKey({
        columnNames: ["requestId"],
        referencedColumnNames: ["id"],
        referencedTableName: "requests",
        onDelete: "CASCADE",
      })
    )

    await queryRunner.createForeignKey(
      "shout-out-videos",
      new TableForeignKey({
        columnNames: ["fanId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )

    await queryRunner.createForeignKey(
      "shout-out-videos",
      new TableForeignKey({
        columnNames: ["influencerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys("shout-out-videos", [
      new TableForeignKey({
        columnNames: ["influencerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),

      new TableForeignKey({
        columnNames: ["fanId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),

      new TableForeignKey({
        columnNames: ["requestId"],
        referencedColumnNames: ["id"],
        referencedTableName: "requests",
        onDelete: "CASCADE",
      }),
    ])

    await queryRunner.dropColumn("shout-out-videos", "influencerId")
    await queryRunner.dropColumn("shout-out-videos", "fanId")
    await queryRunner.dropColumn("shout-out-videos", "requestId")

    await queryRunner.dropTable("shout-out-videos")
  }
}
