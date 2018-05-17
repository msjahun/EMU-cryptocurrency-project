"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=02_blocks.js.map