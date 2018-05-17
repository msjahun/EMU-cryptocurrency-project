import { Blockchain } from "./blockchain";
import { AccountTransaction } from "./transaction";
export declare type Address = string;
export declare type EXTERNAL_ACCOUNT_TYPE = Address;
export declare type CONTRACT_ACCOUNT_TYPE = Address;
export declare const CONTRACT_ACCOUNT = "CONTRACT_ACCOUNT";
export declare const EXTERNAL_ACCOUNT = "EXTERNAL_ACCOUNT";
export declare class Account {
    address: Address;
    balance: number;
    type: string;
    nonce: number;
    constructor(address: Address, balance: number, type: string);
}
export declare class ExternalAccount extends Account {
    publicKey: any;
    private privateKey;
    private storagePath;
    constructor(address: Address, balance: number, type: string, id: string);
    createTransaction(senderNodeId: string, senderAddress: Address, recipientAddress: Address, recipientNodeId: string, value: number, action: string, digitalSignature: string): AccountTransaction;
    createRSAKeys(address: Address): Promise<void>;
    getPublicKey(): string;
    encryptActionRequest(action: string): string;
    decryptActionRequest(action: string): string;
    createDigitalSignature(action: string): string;
    verifyDigitalSignature(action: string, signature: string): any;
}
export declare class ContractAccount extends Account {
    data: any;
    updatedData: any;
    constructor(address: Address, balance: number, type: string, data: any);
    static replacer(key: any, value: any): any;
    static reviver(key: any, value: any): any;
    static parseContractData(blockchain: Blockchain, nodeIdx: number, contractIdx: number, nonce: number): any;
    static updateContractState(blockchain: Blockchain, nodeIdx: number, contractIdx: number, parsedContract: any): any;
}
