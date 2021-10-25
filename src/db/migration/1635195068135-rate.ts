import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class rate1635195068135 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumns('users', [
            new TableColumn({
                name:'rate_dm',
                type:'int',
                isNullable:true
            }),
            new TableColumn({
                name:'rate_shout_out',
                type:'int',
                isNullable:true
            })
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

         await queryRunner.dropColumns('users', [
            new TableColumn({
                name:'rate_dm',
                type:'int',
                isNullable:true
            }),
            new TableColumn({
                name:'rate_shout_out',
                type:'int',
                isNullable:true
            })
        ])

    }

}
