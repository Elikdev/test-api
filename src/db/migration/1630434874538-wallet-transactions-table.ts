import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class walletTransactionsTable1630434874538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable( new Table({
            name:'transaction',
            columns:[
                {
                    name: 'id',
                    isPrimary: true,
                    type: 'int',
                    isGenerated: true,
                },
                {
                    name: 'userId',
                    type: 'int',
                },
                {
                    name: 'amount',
                    type: 'DECIMAL(10,2)',
                    default: 0.00
                },
                {
                    name: 'narration',
                    type: 'varchar'
                },
                {
                    name: 'type',
                    type: "enum",
                    enum: ["credit", "debit"],
                },
                {
                    name: 'credited_by',
                    type: "int"
                },
                {
                    name: "debited_to",
                    type: "json"
                },
                {
                    name: "reference",
                    type: "varchar"
                },
                {
                    // meta details about the transaction
                   name: "meta",
                   type: "json"  
                },
                {
                    name:'status',
                    type: "enum",
                    enum: ["pending", "success", "failed"]
                },
                {
                    name: 'walletId',
                    type: 'int'
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()',
                    onUpdate: "CURRENT_TIMESTAMP(6)"
                }
            ]
        }), true )

        await queryRunner.createForeignKeys("transaction", [
            new TableForeignKey({
                columnNames: ["walletId"],
                referencedColumnNames: ["id"],
                referencedTableName: "wallet"
            }),
            new TableForeignKey({
                columnNames: ["credited_by"],
                referencedColumnNames: ["id"],
                referencedTableName: "user"
            }),
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
            })
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transaction");
        const foreignKey = table.foreignKeys.filter(fk => {
            if(fk.columnNames.includes("walletId")){
                return fk
            }

            if(fk.columnNames.includes("credited_by")){
                return fk
            }
            if(fk.columnNames.includes("userId")){
                return fk
            }
        });
        await queryRunner.dropForeignKeys("transaction", foreignKey);

        await queryRunner.dropTable('transaction')
    }

}
