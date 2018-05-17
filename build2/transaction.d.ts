import { Address } from "./accounts";
export declare class Transaction {
    senderNodeId: string;
    senderAddress: Address;
    recipientNodeId: string;
    recipientAddress: Address;
    value: number;
    transactionType: string;
    senderDigitalSignature: string;
    nonce: number;
    constructor(senderNodeId: string, senderAddress: Address, recipientAddress: Address, recipientNodeId: string, value: number, transactionType: string, nonce: number, senderDigitalSignature?: string);
}
export declare class ContractTransaction extends Transaction {
    data: string;
    initiaterNode: string;
    initiaterAddress: Address;
    method: string;
    args: Array<any>;
    constructor(senderNodeId: string, senderAddress: Address, recipientAddress: Address, recipientNodeId: string, value: number, transactionType: string, nonce: number, initiaterNode: string, initiaterAddress: Address, method: string, args: Array<any>, digitalSignature: string, data?: string);
}
export declare class AccountTransaction extends Transaction {
    constructor(senderNodeId: string, senderAddress: Address, recipientAddress: Address, recipientNodeId: string, value: number, transactionType: string, nonce: number, senderDigitalSignature?: string);
}
