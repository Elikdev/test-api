import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class interestTable1629462224188 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'interest',
            columns: [
                {
                    name: "id",
                    isGenerated: true,
                    type: 'int',
                    isPrimary: true,
                    isNullable: false
                },
                {
                    name: 'industries',
                    type: 'json'
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


        await queryRunner.addColumn("user", new TableColumn({
            name: "interestId",
            type: 'int',
            isNullable: true,
        }))

        await queryRunner.createForeignKey("user", new TableForeignKey({
            columnNames: ["interestId"],
            referencedColumnNames: ["id"],
            referencedTableName: "interest",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("user");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("interestId") !== -1);
        await queryRunner.dropForeignKey("user", foreignKey);
        await queryRunner.dropColumn("user", "interestId")
        await queryRunner.dropTable("interest");
    }

}
