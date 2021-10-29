import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class updateMessageTable1635499083689 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "messages",
      new TableColumn({
        name: "message_id",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.addColumn(
      "messages",
      new TableColumn({
        name: "time",
        type: "timestamp",
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("messages", "message_id")
    await queryRunner.dropColumn("messages", "time")
  }
}
