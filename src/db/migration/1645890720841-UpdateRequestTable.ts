import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm"

export class UpdateRequestTable1645890720841 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "requests",
      new TableColumn({
        name: "request_fulfilled",
        type: "boolean",
        default: false,
      })
    )

    await queryRunner.addColumn(
        "requests",
        new TableColumn({
          name: "roomId",
          type: "int",
          isNullable: true,
        })
    )

    await queryRunner.createForeignKey(
      "requests",
      new TableForeignKey({
        columnNames: ["roomId"],
        referencedColumnNames: ["id"],
        referencedTableName: "rooms",
        onDelete: "CASCADE",
      })
    )

    await queryRunner.addColumn(
        "rooms",
        new TableColumn({
          name: "room_blocked",
          type: "boolean",
          default: false,
        })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys("requests", [
      new TableForeignKey({
        columnNames: ["roomId"],
        referencedColumnNames: ["id"],
        referencedTableName: "rooms",
        onDelete: "CASCADE",
      }),
    ])
    await queryRunner.dropColumn("requests", "roomId")
    await queryRunner.dropColumn("requests", "request_fulfilled")
    await queryRunner.dropColumn("rooms", "room_blocked")
  }
}
