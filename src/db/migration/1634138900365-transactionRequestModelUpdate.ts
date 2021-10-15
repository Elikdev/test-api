import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";
import { RequestDelivery, RequestType, TransactionStatus } from "../../utils/enum";

export class transactionRequestModelUpdate1634138900365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('requests', [
            new TableColumn({
                name:'request_type',
                type:'varchar',
                enum:[RequestType.DM, RequestType.SHOUT_OUT],
                isNullable:false,
            }),
              new TableColumn({
                name:'request_delivery',
                type:'varchar',
                isNullable:true,
                enum:[RequestDelivery.EXPRESS, RequestDelivery.STANDARD],
            })
        ])

        await queryRunner.addColumns('transactions', [
            new TableColumn({
                name:'transaction_reference',
                type:'varchar',
                isNullable:false
            }),
            new TableColumn({
                name:'transaction_id',
                type:'varchar',
                isNullable:false
            }),
            new TableColumn({
                name:'status',
                type:'varchar',
                enum:[TransactionStatus.FAILED, TransactionStatus.PENDING, TransactionStatus.SUCCESS]
            })
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.dropColumns('requests', [
            new TableColumn({
                name:'request_type',
                type:'varchar',
                enum:[RequestType.DM, RequestType.SHOUT_OUT],
                isNullable:false
            }),
              new TableColumn({
                name:'request_delivery',
                type:'varchar',
                enum:[RequestDelivery.EXPRESS, RequestDelivery.STANDARD],
                isNullable:true
            })
        ])

         await queryRunner.dropColumns('transactions', [
            new TableColumn({
                name:'transaction_reference',
                type:'varchar',
                isNullable:false
            }),
            new TableColumn({
                name:'transaction_id',
                type:'varchar',
                isNullable:false
            }),
            new TableColumn({
                name:'status',
                type:'varchar',
                enum:[TransactionStatus.FAILED, TransactionStatus.PENDING, TransactionStatus.SUCCESS]
            })
        ])
    }

}
