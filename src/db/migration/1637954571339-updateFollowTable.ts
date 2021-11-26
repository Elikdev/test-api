import {MigrationInterface, QueryRunner, TableForeignKey, TableColumn} from "typeorm";

export class updateFollowTable1637954571339 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("follow", "followed_id")
        await queryRunner.dropColumn("follow", "follower_id")

        await queryRunner.addColumn(
            "follow",
            new TableColumn({
              name: "followed_id",
              type: "int",
              isNullable: true,
            })
          )

          await queryRunner.addColumn(
            "follow",
            new TableColumn({
              name: "follower_id",
              type: "int",
              isNullable: true,
            })
          )

        await queryRunner.createForeignKeys("follow",
            [
                new TableForeignKey({
                    columnNames: ["followed_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "users",
                    onDelete: "CASCADE",
                  }),

                  new TableForeignKey({
                    columnNames: ["follower_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "users",
                    onDelete: "CASCADE",
                  })

            ]
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKeys("follow", [
            new TableForeignKey({
                columnNames: ["followed_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
              }),

              new TableForeignKey({
                columnNames: ["follower_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
              })
        ])

        await queryRunner.dropColumn("follow", "follower_id")

        await queryRunner.dropColumn("follow", "followed_id")

        await queryRunner.addColumn("follow", new TableColumn({
            name: "followed_id",
            type: "int",
        }))

        await queryRunner.addColumn("follow", new TableColumn({
            name: "follower_id",
            type: "int",
        }))

        await queryRunner.createForeignKeys("follow",
        [
            new TableForeignKey({
                columnNames: ["followed_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
              }),

              new TableForeignKey({
                columnNames: ["follower_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
              })

        ]
    )

    }

}
