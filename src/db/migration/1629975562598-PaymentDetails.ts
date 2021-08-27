import {
 MigrationInterface,
 QueryRunner,
 Table,
 TableColumn,
 TableIndex,
 TableForeignKey,
} from "typeorm";

export class PaymentDetails1629975562598 implements MigrationInterface {
 public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.createTable(
   new Table({
    name: "payment_detail",
    columns: [
     {
      name: "id",
      type: "int",
      isPrimary: true,
      isNullable: false,
      isGenerated: true,
     },
     {
      name: "accountName",
      type: "varchar",
      isNullable: false,
     },
     {
      name: "accountNumber",
      type: "varchar",
      isNullable: false,
      isUnique: true,
     },

     {
      name: "bankCode",
      type: "varchar",
      isNullable: false,
     },
     {
      name: "frequency",
      type: "varchar",
      isNullable: false,
     },
     {
      name: "frequencyAmount",
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
  );

  await queryRunner.createIndex(
   "payment_detail",
   new TableIndex({
    name: "accountNumber",
    columnNames: ["accountNumber"],
   })
  );

  await queryRunner.addColumn(
   "user",
   new TableColumn({
    name: "paymentDetailsId",
    type: "int",
    isNullable: true,
   })
  );

  await queryRunner.createForeignKey(
   "user",
   new TableForeignKey({
    columnNames: ["paymentDetailsId"],
    referencedColumnNames: ["id"],
    referencedTableName: "payment_detail",
    onDelete: "SET NULL",
   })
  );
 }

 public async down(queryRunner: QueryRunner): Promise<void> {
  const table = await queryRunner.getTable("user");
  const foreignKey = table.foreignKeys.find(
   (fk) => fk.columnNames.indexOf("paymentDetailsId") !== -1
  );
  await queryRunner.dropForeignKey("user", foreignKey);
  await queryRunner.dropColumn("user", "paymentDetailsId");
  await queryRunner.dropTable("payment_detail");
 }
}
