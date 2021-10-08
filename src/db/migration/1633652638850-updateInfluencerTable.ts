import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class updateInfluencerTable1633652638850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "is_admin_verified",
            type: "boolean",
            default: false
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "is_admin_verified")
    }

}
