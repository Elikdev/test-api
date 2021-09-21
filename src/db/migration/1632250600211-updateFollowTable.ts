import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class updateFollowTable1632250600211 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("followers", "id")

        await queryRunner.addColumn(
            "followers",
            new TableColumn({
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                isNullable: false,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("follwers", "id")

        await queryRunner.addColumn(
            "followers",
            new TableColumn({
                name: "id",
                type: "int",
                isPrimary: true,
            })
        )
    }
}
