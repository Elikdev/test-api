import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { AccountType } from "../../enums";

export class user1629184616389 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true
                },
                {
                    name: 'firstName',
                    type: 'varchar'
                },


                {
                    name: 'lastName',
                    type: 'varchar'
                },


                {
                    name: 'password',
                    type: 'varchar',
                },



                {
                    name: 'username',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },


                {
                    name: 'profile_pic',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'descriptions',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'account_type',
                    type: "enum",
                    enum: [AccountType.ADMIN, AccountType.FAN, AccountType.CELEB]
                },

                {
                    name: 'status',
                    type: "enum",
                    enum: ['disabled', 'active', 'pending'],
                    default: `'pending'`
                },


                {
                    name: 'sex',
                    type: "enum",
                    enum: ["male", "female"],
                    isNullable: true
                },


                {
                    name: 'date_of_birth',
                    type: "DATE",
                    isNullable: true
                },

                {
                    name: 'phone',
                    type: 'varchar',

                },
                {
                    name: 'profile_wallpaper',
                    type: "varchar",
                    isNullable: true
                },

                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true
                },

                {
                    name: 'last_seen',
                    type: 'timestamp',
                    default: "CURRENT_TIMESTAMP(6)"
                },


                {
                    name: 'followers_count',
                    type: 'int',
                    default: 0
                },


                {
                    name: 'following_count',
                    type: 'int',
                    default: 0
                },


                {
                    name: 'posts_count',
                    type: 'int',
                    default: 0,

                },


                {
                    name: 'location',
                    type: 'varchar',
                    isNullable: true,
                },


                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: "CURRENT_TIMESTAMP(6)",
                },


                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: "CURRENT_TIMESTAMP(6)",
                    onUpdate: "CURRENT_TIMESTAMP(6)"
                },
                {
                    name: 'archived',
                    type: "boolean",
                    default: false
                }
            ]
        }))

        await queryRunner.createIndex("user",
            new TableIndex({
                name: "email",
                columnNames: ["email"]
            })
        )

        await queryRunner.createIndex("user",
            new TableIndex({
                name: "username",
                columnNames: ["username"]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }

}
