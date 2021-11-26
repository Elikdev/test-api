import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class updateUsersRequests1637956666947 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users_requests_requests", "requestsId")

        await queryRunner.addColumn(
            "users_requests_requests",
            new TableColumn({
              name: "requestsId",
              type: "int",
              isNullable: true,
            })
          )

        await queryRunner.createForeignKeys("users_requests_requests",
            [
                new TableForeignKey({
                    columnNames: ["requestsId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "requests",
                    onDelete: "CASCADE",
                  })

            ]
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKeys("users_requests_requests", [
            new TableForeignKey({
                columnNames: ["requestsId"],
                referencedColumnNames: ["id"],
                referencedTableName: "requests",
                onDelete: "CASCADE",
              })
        ])

        await queryRunner.dropColumn("users_requests_requests", "requestsId")

        await queryRunner.addColumn(
            "users_requests_requests",
            new TableColumn({
              name: "requestsId",
              type: "int",
            })
          )

          await queryRunner.createForeignKeys("users_requests_requests",
          [
              new TableForeignKey({
                  columnNames: ["requestsId"],
                  referencedColumnNames: ["id"],
                  referencedTableName: "requests"
                })

          ]
      )
    }

}
