import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class requestUserRelationShip1634142085242 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('requests', [
            new TableColumn({
                name:'fan',
                type:'int',
                isNullable:false
            }),
             new TableColumn({
                 name:'influencer',
                 type:'int',
                 isNullable:false
             })
        ])

        await queryRunner.createForeignKeys('requests',[
            new TableForeignKey({
                columnNames:['fan'],
                referencedColumnNames:['id'],
                referencedTableName:"users",
            }),
            new TableForeignKey({
                columnNames:['influencer'],
                referencedColumnNames:['id'],
                referencedTableName:"users",
            })
        ])

       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.dropColumns('requests', [
            new TableColumn({
                name:'fan',
                type:'int',
                isNullable:false
            }),
             new TableColumn({
                 name:'influencer',
                 type:'int',
                 isNullable:false
             })
        ])

        await queryRunner.dropForeignKeys('requests',[
            // new TableForeignKey({
            //     columnNames:['fan'],
            //     referencedColumnNames:['id'],
            //     referencedTableName:"users",
            // }),
            // new TableForeignKey({
            //     columnNames:['influencer'],
            //     referencedColumnNames:['id'],
            //     referencedTableName:"users",
            // })
        ])


    }

}
