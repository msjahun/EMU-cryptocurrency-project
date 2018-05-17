"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
}
exports.Transaction = Transaction;
class Block {
}
exports.Block = Block;
class Blockchain {
    constructor(nodeId) {
        this.nodeId = nodeId;
        this.blocks = [];
        this.transactionPool = [];
    }
    // Submits new transaction
    submitTransaction() {
        // TBD
    }
    // Creates new block on the blockchain.
    createBlock() {
        // TBD
    }
}
exports.Blockchain = Blockchain;
//# sourceMappingURL=03_transactions.js.map