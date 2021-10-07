import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateUserTable1633595915025 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("users", "phone_number", new TableColumn({
            name: "phone_number", 
            type: "varchar",
            isNullable: false,
            isUnique: true,
        }))

        await queryRunner.changeColumn("users", "is_verified", new TableColumn({
            name: "is_verified",
            type: "boolean",
            default: false
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("users", "phone_number", new TableColumn({
            name: "phone_number",
            type: "int", 
            isNullable: false,
            isUnique: true
        }))

        await queryRunner.changeColumn("users", "is_verified", new TableColumn({
            name: "is_verified",
            type: "boolean"
        }))
    }

}
