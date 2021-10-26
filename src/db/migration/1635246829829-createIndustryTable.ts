import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";

export class createIndustryTable1635246829829 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "industry")

        await queryRunner.createTable(new Table({
            name: 'industry',
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


        await queryRunner.addColumn("users", new TableColumn({
            name: "industryId",
            type: 'int',
            isNullable: true,
        }))

        await queryRunner.createForeignKey("users", new TableForeignKey({
            columnNames: ["industryId"],
            referencedColumnNames: ["id"],
            referencedTableName: "industry",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "industry")

        const table = await queryRunner.getTable("users");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("industryId") !== -1);
        await queryRunner.dropForeignKey("users", foreignKey);
        await queryRunner.dropColumn("users", "industryId")
        await queryRunner.dropTable("industry");
    }
    
}
