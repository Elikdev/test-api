export enum Gender {
    MALE = "male",
    FEMALE = "female",
    UNKNOWN = "none"
}

export enum AccountStatus {
    DISABLED = "disabled",
    ACTIVE = "active",
}

export enum AccountType {
    FAN = "fan",
    ADMIN = "admin",
    CELEB = "celebrity"
}

export enum RoleType {
    BAMIKI_ADMIN = "TEST_API_ADMIN",
    BAMIKI_USER = "TEST_API_USER"
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
    PENDING = "pending",
    CANCELLED = "cancelled"
}

export enum RequestType{
    DM='direct message',
    SHOUT_OUT="shout out"
}

export enum RequestDelivery{
    STANDARD="standard",
    EXPRESS="express"
}

export type IncomingMessage = {
    id: number;
    sender: any;
    receiver: any;
    message: any;
    room: number;
    room_id: string;
    unique_msg_id: string;
    time: Date;
    created_at: Date;
    updated_at: Date;
   }

export enum AdminCategory {
    SUPER_ADMIN = "super admin",
    SUB_ADMIN = "sub admin"
}

export enum Permissions {
    VERIFY_INFLUENCERS = "verify influencers",
    CHAT_SUPPORT = "chat support",
    FREEZE_ACCOUNT = 'freeze accounts',
    BLOCK_ACCOUNT = "block accounts"
}

export enum LiveVideoVerificationStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    DECLINED = "declined"
}

export enum transactionSettingsType {
    TRANSACTION_FEE = "transaction_fee",
    EXPRESS_TIMELINE = "express_timeline",
    STANDARD_TIMELINE = "standard_timeline",
    EXPRESS_FEE = "express_fee"
}

export enum searchFieldType {
    FAN = "fan",
    INFLUENCER = "influencer",
    VERIFICATION = "verification"
}

export enum campaignType {
    EMAIL = "email",
    SMS = "sms"
}

export enum campaignStatus {
    DELIVERED = "delivered",
    SCHEDULED = "scheduled"
}