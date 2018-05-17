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
    constructor(blockNumber: number, transactions: Array<Transaction>, timestamp: number, nonce: number, prevBlock: string);
    sha256(): string;
}
export declare class Blockchain {
    static readonly GENESIS_BLOCK: Block;
    static readonly DIFFICULTY: number;
    static readonly TARGET: number;
    static readonly MINING_SENDER: string;
    static readonly MINING_REWARD: number;
    nodeId: string;
    blocks: Array<Block>;
    transactionPool: Array<Transaction>;
    private storagePath;
    constructor(nodeId: string);
    private save();
    private load();
    private verify();
    static isPoWValid(pow: string): boolean;
    private mineBlock(transactions);
    submitTransaction(senderAddress: Address, recipientAddress: Address, value: number): void;
    createBlock(): Block;
    getLastBlock(): Block;
    static now(): number;
}
