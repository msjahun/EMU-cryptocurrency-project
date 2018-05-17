export declare type Address = string;
export declare class Transaction {
    senderAddress: Address;
    recipientAddress: Address;
    value: number;
    constructor(senderAddress: Address, recipientAddress: Address, value: number);
}
export declare class Block {
    blockNumber: number;
    transactions: Array<Transaction>;
    timestamp: number;
    nonce: number;
    prevBlock: string;
}
export declare class Blockchain {
    nodeId: string;
    blocks: Array<Block>;
    transactionPool: Array<Transaction>;
    constructor(nodeId: string);
    submitTransaction(senderAddress: Address, recipientAddress: Address, value: number): void;
    createBlock(): void;
}
