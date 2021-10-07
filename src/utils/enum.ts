export enum Gender {
    MALE = "male",
    FEMALE = "female",
    UNKNOWN = "none"
}

export enum AccountStatus {
    DISABLED = "disabled",
    ACTIVE = "active",
    PENDING = "pending"
}

export enum AccountType {
    FAN = "fan",
    ADMIN = "admin",
    CELEB = "celebrity"
}

export enum ChannelType {
    EMAIL = "email",
    SMS = "sms",
}

export enum PaymentInterval {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
}

export enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
}

export enum MessageType {
    IMAGE = "image",
    VIDEO = "video",
    TEXT = "text",
}

export type innerResponse = {
    status: boolean,
    statusCode: number,
    message: string,
    data: any
}

export interface jwtCred {
    id: number
    handle: string
    email: string
    full_name: string
}


export enum IndustriesType{
    
}

export type Industry = {
    name: string
    slug: string
}

export type Industries = Industry[]

export type Bank = {
 name: string;
 code: string;
};

export type MediaData = {
    url: string
    type: MediaType
}
export enum TransactionType  {
    CREDIT = "credit",
    DEBIT = "debit"
}

export enum TransactionStatus {
    PENDING = "pending", 
    SUCCESS = "success", 
    FAILED = "failed"
}

export type DebitDetails = {
    accountName: string,
    accountNumber: string,
    bankCode: string,
}

export type Banks = Bank[];

export enum RequestStatus {
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    PENDING = "pending"
}