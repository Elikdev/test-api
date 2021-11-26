import {MigrationInterface, QueryRunner, TableForeignKey, TableColumn} from "typeorm";

export class updateMessages1637958374400 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("messages", "sender")
        await queryRunner.dropColumn("messages", "receiver")

        await queryRunner.addColumn(
            "messages",
            new TableColumn({
              name: "sender",
              type: "int",
              isNullable: true,
            })
          )

          await queryRunner.addColumn(
            "messages",
            new TableColumn({
              name: "receiver",
              type: "int",
              isNullable: true,
            })
          )


        await queryRunner.createForeignKeys('messages',[
            new TableForeignKey({
                columnNames:["sender"],
                referencedColumnNames:["id"],
                referencedTableName:"users",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames:["receiver"],
                referencedColumnNames:["id"],
                referencedTableName:"users",
                onDelete: "CASCADE",
            }),
        ])

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
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames:['influencer'],
                referencedColumnNames:['id'],
                referencedTableName:"users",
                onDelete: "CASCADE"
            })
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKeys('requests',[
            new TableForeignKey({
                columnNames:['fan'],
                referencedColumnNames:['id'],
                referencedTableName:"users",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames:['influencer'],
                referencedColumnNames:['id'],
                referencedTableName:"users",
                onDelete: "CASCADE"
            })
        ])

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

        await queryRunner.dropForeignKeys('messages', [
            new TableForeignKey({
                columnNames:["sender"],
                referencedColumnNames:["id"],
                referencedTableName:"users",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames:["receiver"],
                referencedColumnNames:["id"],
                referencedTableName:"users",
                onDelete: "CASCADE",
            }),
        ])

        await queryRunner.dropColumn("messages", "receiver")
        await queryRunner.dropColumn("messages", "sender")

        await queryRunner.addColumn("messages", new TableColumn({
            name: "receiver",
            type: "int",
        }))

        await queryRunner.addColumn("messages", new TableColumn({
            name: "sender",
            type: "int",
        }))

        await queryRunner.createForeignKeys('messages',[
            new TableForeignKey({
                columnNames:["sender"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            }),
            new TableForeignKey({
                columnNames:["receiver"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            }),
        ])
    }

}
