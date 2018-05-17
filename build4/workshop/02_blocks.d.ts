export declare class Block {
    blockNumber: number;
    transactions: Array<any>;
    timestamp: number;
    nonce: number;
    prevBlock: string;
}
export declare class Blockchain {
    nodeId: string;
    blocks: Array<Block>;
    transactionPool: Array<any>;
    constructor(nodeId: string);
    submitTransaction(): void;
    createBlock(): void;
}
