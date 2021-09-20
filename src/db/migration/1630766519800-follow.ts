import {MigrationInterface, QueryRunner,Table, TableIndex, TableColumn, TableForeignKey} from "typeorm";

export class followers1630421611615 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "followers",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true
                },

                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP(6)",
                   },
            ]
        }), true)
        await queryRunner.addColumn("followers", new TableColumn({
            name: "followed_id",
            type: "int"
        }));
        await queryRunner.addColumn("followers", new TableColumn({
            name: "follower_id",
            type: "int"
        }));
        await queryRunner.createForeignKey("followers", new TableForeignKey({
            columnNames: ["follower_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
        await queryRunner.createForeignKey("followers", new TableForeignKey({
            columnNames: ["followed_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("followers")
    }

}
