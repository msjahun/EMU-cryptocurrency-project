"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor(senderAddress, recipientAddress, value) {
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.value = value;
    }
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
    submitTransaction(senderAddress, recipientAddress, value) {
        this.transactionPool.push(new Transaction(senderAddress, recipientAddress, value));
    }
    // Creates new block on the blockchain.
    createBlock() {
        // TBD
    }
}
exports.Blockchain = Blockchain;
//# sourceMappingURL=04_submit_transaction.js.map