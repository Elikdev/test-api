import {MigrationInterface, QueryRunner} from "typeorm";

export class updateWalletUserRelationship1630433874303 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('wallet','user', 'userId')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('wallet', 'userId', 'user')
    }

}
