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
                              type: "int",
                              isNullable: false,
                       },
                       {
                              name: "interval",
                              type: "enum",
                              enum: ["monthly", "weekly", "daily"],
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
         "payment_detail",
         new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true,
         })
  );

  await queryRunner.createForeignKey(
            "payment_detail",
            new TableForeignKey({
                      columnNames: ["userId"],
                      referencedColumnNames: ["id"],
                      referencedTableName: "user",
                      onDelete: "CASCADE",
            })
  );
 }

 public async down(queryRunner: QueryRunner): Promise<void> {
  const table = await queryRunner.getTable("payment_detail");
  const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("userId") !== -1
  );
  await queryRunner.dropForeignKey("payment_detail", foreignKey);
  await queryRunner.dropColumn("payment_detail", "userId");
  await queryRunner.dropTable("payment_detail");
 }
}
