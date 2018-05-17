"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha256_1 = require("js-sha256");
const Serializer_1 = require("serializer.ts/Serializer");
class Transaction {
    constructor(senderAddress, recipientAddress, value) {
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.value = value;
    }
}
exports.Transaction = Transaction;
class Block {
    constructor(blockNumber, transactions, timestamp, nonce, prevBlock) {
        this.blockNumber = blockNumber;
        this.transactions = transactions;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.prevBlock = prevBlock;
    }
    // Calculates the SHA256 of the entire block, including its transactions.
    sha256() {
        return js_sha256_1.sha256(JSON.stringify(Serializer_1.serialize(this)));
    }
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
//# sourceMappingURL=05_hash_function.js.map