import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class updateSettingsTable1641215776641 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "settings",
      "transaction_fee",
      new TableColumn({
        name: "transaction_fee",
        type: "float",
        isNullable: true,
      })
    )

    await queryRunner.changeColumn(
      "settings",
      "standard_delivery_time",
      new TableColumn({
        name: "standard_delivery_time",
        type: "float",
        isNullable: true,
      })
    )

    await queryRunner.changeColumn(
      "settings",
      "express_delivery_time",
      new TableColumn({
        name: "express_delivery_time",
        type: "float",
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "settings",
      "express_delivery_time",
      new TableColumn({
        name: "express_delivery_time",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.changeColumn(
      "settings",
      "standard_delivery_time",
      new TableColumn({
        name: "standard_delivery_time",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.changeColumn(
      "settings",
      "transaction_fee",
      new TableColumn({
        name: "transaction_fee",
        type: "int",
        isNullable: true,
      })
    )
  }
}
