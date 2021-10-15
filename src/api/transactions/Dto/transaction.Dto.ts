export class CreateTransactionsDto{
    type?:string;
    description:string;
    amount:number;
    user:number;
    transaction_reference:string;
    transaction_id:number;
    status:string;
}

