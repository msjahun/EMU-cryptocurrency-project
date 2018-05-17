"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serializer_1 = require("serializer.ts/Serializer");
const js_sha256_1 = require("js-sha256");
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
//# sourceMappingURL=block.js.map