import { Transaction } from "./transaction";
export declare class Block {
    blockNumber: number;
    transactions: Array<Transaction>;
    timestamp: number;
    nonce: number;
    prevBlock: string;
    constructor(blockNumber: number, transactions: Array<Transaction>, timestamp: number, nonce: number, prevBlock: string);
    sha256(): string;
}
