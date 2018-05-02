"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha256_1 = require("js-sha256");
const Serializer_1 = require("serializer.ts/Serializer");
const bignumber_js_1 = require("bignumber.js");
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
        this.blocks = [Blockchain.GENESIS_BLOCK];
        this.transactionPool = [];
    }
    // Validates PoW.
    static isPoWValid(pow) {
        try {
            if (!pow.startsWith("0x")) {
                pow = `0x${pow}`;
            }
            return new bignumber_js_1.default(pow).lessThanOrEqualTo(Blockchain.TARGET.toString());
        }
        catch (_a) {
            return false;
        }
    }
    // Mines for block.
    mineBlock(transactions) {
        // Create a new block which will "point" to the last block.
        const lastBlock = this.getLastBlock();
        const newBlock = new Block(lastBlock.blockNumber + 1, transactions, Blockchain.now(), 0, lastBlock.sha256());
        while (true) {
            const pow = newBlock.sha256();
            console.log(`Mining #${newBlock.blockNumber}: nonce: ${newBlock.nonce}, pow: ${pow}`);
            if (Blockchain.isPoWValid(pow)) {
                console.log(`Found valid POW: ${pow}!`);
                break;
            }
            newBlock.nonce++;
        }
        return newBlock;
    }
    // Submits new transaction
    submitTransaction(senderAddress, recipientAddress, value) {
        this.transactionPool.push(new Transaction(senderAddress, recipientAddress, value));
    }
    // Creates new block on the blockchain.
    createBlock() {
        // TBD
    }
    getLastBlock() {
        return this.blocks[this.blocks.length - 1];
    }
    static now() {
        return Math.round(new Date().getTime() / 1000);
    }
}
// Let's define that our "genesis" block as an empty block, starting from now.
Blockchain.GENESIS_BLOCK = new Block(0, [], Blockchain.now(), 0, "");
Blockchain.DIFFICULTY = 4;
Blockchain.TARGET = Math.pow(2, (256 - Blockchain.DIFFICULTY));
exports.Blockchain = Blockchain;
const blockchain = new Blockchain("node123");
const txn1 = new Transaction("Alice", "Bob", 1000);
const txn2 = new Transaction("Alice", "Eve", 12345);
const block = blockchain.mineBlock([txn1, txn2]);
console.log(`Mined block: ${JSON.stringify(Serializer_1.serialize(block))}`);
console.log(`Mined block with: ${block.sha256()}`);
//# sourceMappingURL=06_pow.js.map