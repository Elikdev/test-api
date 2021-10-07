import {MigrationInterface, QueryRunner} from "typeorm";

export class initialMigratiuon1633576185170 implements MigrationInterface {
    name = 'initialMigratiuon1633576185170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "requests" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "purpose" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "reason" character varying NOT NULL DEFAULT 'none',
                "transactionId" integer,
                CONSTRAINT "REL_b61336590cc4225c72557beb01" UNIQUE ("transactionId"),
                CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "type" character varying NOT NULL DEFAULT 'credit',
                "description" character varying NOT NULL,
                "amount" integer NOT NULL,
                "userId" integer,
                CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "follow" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "followed_id" integer,
                "follower_id" integer,
                CONSTRAINT "PK_fda88bc28a84d2d6d06e19df6e5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "full_name" character varying NOT NULL,
                "handle" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "phone_number" integer NOT NULL,
                "country_code" integer NOT NULL,
                "is_verified" boolean NOT NULL,
                "profile_image" character varying,
                "interests" text,
                "industry" text,
                "social_media_link" character varying,
                "live_video" character varying,
                "type" character varying NOT NULL,
                "walletId" integer,
                CONSTRAINT "UQ_6a7e5f591436179c411f5308a9e" UNIQUE ("handle"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number"),
                CONSTRAINT "REL_0a95e6aab86ff1b0278c18cf48" UNIQUE ("walletId"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type")
        `);
        await queryRunner.query(`
            CREATE TABLE "wallet" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "wallet_balance" integer NOT NULL,
                "ledger_balance" integer NOT NULL,
                CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users_requests_requests" (
                "usersId" integer NOT NULL,
                "requestsId" integer NOT NULL,
                CONSTRAINT "PK_24bc50da9131815da5e4e07b2c8" PRIMARY KEY ("usersId", "requestsId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9a4b90190db86e203b0ae1866e" ON "users_requests_requests" ("usersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2d2a959da6333c35860b753710" ON "users_requests_requests" ("requestsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "requests"
            ADD CONSTRAINT "FK_b61336590cc4225c72557beb01f" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "follow"
            ADD CONSTRAINT "FK_952d77375f7e56e7037893744d1" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "follow"
            ADD CONSTRAINT "FK_e65ef3268d3d5589f94b09c2373" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_0a95e6aab86ff1b0278c18cf48e" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users_requests_requests"
            ADD CONSTRAINT "FK_9a4b90190db86e203b0ae1866eb" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "users_requests_requests"
            ADD CONSTRAINT "FK_2d2a959da6333c35860b753710e" FOREIGN KEY ("requestsId") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users_requests_requests" DROP CONSTRAINT "FK_2d2a959da6333c35860b753710e"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_requests_requests" DROP CONSTRAINT "FK_9a4b90190db86e203b0ae1866eb"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_0a95e6aab86ff1b0278c18cf48e"
        `);
        await queryRunner.query(`
            ALTER TABLE "follow" DROP CONSTRAINT "FK_e65ef3268d3d5589f94b09c2373"
        `);
        await queryRunner.query(`
            ALTER TABLE "follow" DROP CONSTRAINT "FK_952d77375f7e56e7037893744d1"
        `);
        await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"
        `);
        await queryRunner.query(`
            ALTER TABLE "requests" DROP CONSTRAINT "FK_b61336590cc4225c72557beb01f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2d2a959da6333c35860b753710"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9a4b90190db86e203b0ae1866e"
        `);
        await queryRunner.query(`
            DROP TABLE "users_requests_requests"
        `);
        await queryRunner.query(`
            DROP TABLE "wallet"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "follow"
        `);
        await queryRunner.query(`
            DROP TABLE "transactions"
        `);
        await queryRunner.query(`
            DROP TABLE "requests"
        `);
    }

}
