import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm"
import { campaignStatus, campaignType } from "../../utils/enum"

export class CampaignTable1644677226962 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "campaign",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "sender",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "campaign_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "type",
            type: "varchar",
            enum: [campaignType.EMAIL, campaignType.SMS],
            isNullable: true,
          },
          {
            name: "text",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            enum: [campaignStatus.DELIVERED, campaignStatus.SCHEDULED],
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
      "campaign",
      new TableColumn({
        name: "userId",
        type: "int",
        isNullable: true,
      })
    )

    await queryRunner.createForeignKey(
      "campaign",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("campaign")
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("userId") !== -1
    )
    await queryRunner.dropForeignKey("campaign", foreignKey)
    await queryRunner.dropColumn("campaign", "userId")
    await queryRunner.dropTable("campaign")
  }
}
