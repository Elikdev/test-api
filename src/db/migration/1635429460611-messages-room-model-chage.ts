import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class messagesRoomModelChage1635429460611 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.renameColumn('rooms', 'unique_string','room_id')

        await queryRunner.addColumn('messages',new TableColumn({
            name:'room_id',
            type:'varchar',
            isNullable:false
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.renameColumn('rooms', 'room_id','unique_string')

        await queryRunner.dropColumn('messages',new TableColumn({
            name:'room_id',
            type:'varchar',
            isNullable:false
        }))
    }

}
