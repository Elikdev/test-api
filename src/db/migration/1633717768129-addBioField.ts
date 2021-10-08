import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addBioField1633717768129 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "bio",
            type: "varchar",
            isNullable: true
        }))
        
    }
    

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "bio")
    }

}
