import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class messagesRoomModel1635324312254 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:'rooms',
                columns:[
                    {
                        name: "id",
                        type: "int",
                        isGenerated: true,
                        isNullable: false,
                        isPrimary: true,
                    },
                    {
                        name:'influencer',
                        type:'int',
                    },
                    {
                        name:'fan',
                        type:'int',
                    },
                    {
                        name:'unique_string',
                        type:'varchar',
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                        onUpdate: "CURRENT_TIMESTAMP(6)",
                     },
                ]
            })
        )

        await queryRunner.createTable(
            new Table({
                name:'messages',
                columns:[
                    {
                        name: "id",
                        type: "int",
                        isGenerated: true,
                        isNullable: false,
                        isPrimary: true,
                    },
                    {
                        name:'sender',
                        type:'int',
                    },
                    {
                        name:'receiver',
                        type:'int',
                    },
                    {
                        name:'message',
                        type:'varchar'
                    },
                    {
                        name:'room',
                        type:'int'
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                        onUpdate: "CURRENT_TIMESTAMP(6)",
                     },
                ]
            })
        )

        await queryRunner.createForeignKeys('rooms',[
            new TableForeignKey({
                columnNames:["influencer"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            }),
            new TableForeignKey({
                columnNames:["fan"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            })
        ])

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
            new TableForeignKey({
                columnNames:["room"],
                referencedColumnNames:["id"],
                referencedTableName:"rooms"
            })
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.dropForeignKeys("messages",[

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
            new TableForeignKey({
                columnNames:["room"],
                referencedColumnNames:["id"],
                   referencedTableName:"rooms"
            })
        ])
        
        await queryRunner.dropForeignKeys('rooms',[
            new TableForeignKey({
                columnNames:["influencer"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            }),
            new TableForeignKey({
                columnNames:["fan"],
                referencedColumnNames:["id"],
                referencedTableName:"users"
            })
        ])
        await queryRunner.dropTable("messages")
        await queryRunner.dropTable('rooms')
    }

}
