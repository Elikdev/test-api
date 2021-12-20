import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import { LiveVideoVerificationStatus } from "../../utils/enum";

export class adminChanges1639870775756 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "live_video_verification_status",
            type: "enum",
            enum: ["pending", "verified", "declined"],
            default: `'pending'`

        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "live_video_verification_status")
    }

}
