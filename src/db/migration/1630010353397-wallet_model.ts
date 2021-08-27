import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class walletModel1630010353397 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'wallet',
            columns: [
                {
                    name: 'id',
                    isPrimary: true,
                    type: 'int',
                    isGenerated: true,
                },
                {
                    name: 'user',
                    type: 'int',
                },
                {
                    name: 'balance',
                    type: 'DECIMAL(10,2)',
                    default: 0.00
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
        }), true)

        await queryRunner.createForeignKey("wallet", new TableForeignKey({
            columnNames: ["user"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("wallet")
    }
}
