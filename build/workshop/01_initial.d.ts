export declare class Blockchain {
    nodeId: string;
    blocks: Array<any>;
    transactionPool: Array<any>;
    constructor(nodeId: string);
    submitTransaction(): void;
    createBlock(): void;
}
