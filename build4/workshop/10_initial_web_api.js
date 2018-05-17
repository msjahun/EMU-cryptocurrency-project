"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha256_1 = require("js-sha256");
const Serializer_1 = require("serializer.ts/Serializer");
const bignumber_js_1 = require("bignumber.js");
const fs = require("fs");
const path = require("path");
const deepEqual = require("deep-equal");
const uuidv4 = require("uuid/v4");
const express = require("express");
const bodyParser = require("body-parser");
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
        this.transactionPool = [];
        this.storagePath = path.resolve(__dirname, "../", `${this.nodeId}.blockchain`);
        // Load the blockchain from the storage.
        this.load();
    }
    // Saves the blockchain to the disk.
    save() {
        fs.writeFileSync(this.storagePath, JSON.stringify(Serializer_1.serialize(this.blocks), undefined, 2), "utf8");
    }
    // Loads the blockchain from the disk.
    load() {
        try {
            this.blocks = Serializer_1.deserialize(Block, JSON.parse(fs.readFileSync(this.storagePath, "utf8")));
        }
        catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            this.blocks = [Blockchain.GENESIS_BLOCK];
        }
        finally {
            this.verify();
        }
    }
    // Verifies the blockchain.
    verify() {
        // The blockchain can't be empty. It should always contain at least the genesis block.
        if (this.blocks.length === 0) {
            throw new Error("Blockchain can't be empty!");
        }
        // The first block has to be the genesis block.
        if (!deepEqual(this.blocks[0], Blockchain.GENESIS_BLOCK)) {
            throw new Error("Invalid first block!");
        }
        // Verify the chain itself.
        for (let i = 1; i < this.blocks.length; ++i) {
            const current = this.blocks[i];
            // Verify block number.
            if (current.blockNumber !== i) {
                throw new Error(`Invalid block number ${current.blockNumber} for block #${i}!`);
            }
            // Verify that the current blocks properly points to the previous block.
            const previous = this.blocks[i - 1];
            if (current.prevBlock !== previous.sha256()) {
                throw new Error(`Invalid previous block hash for block #${i}!`);
            }
            // Verify the difficutly of the PoW.
            //
            // TODO: what if the diffuclty was adjusted?
            if (!Blockchain.isPoWValid(current.sha256())) {
                throw new Error(`Invalid previous block hash's difficutly for block #${i}!`);
            }
        }
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
        // Mine the transactions in a new block.
        const newBlock = this.mineBlock(this.transactionPool);
        // Append the new block to the blockchain.
        this.blocks.push(newBlock);
        // Remove the mined transactions.
        this.transactionPool = [];
        // Save the blockchain to the storage.
        this.save();
        return newBlock;
    }
    getLastBlock() {
        return this.blocks[this.blocks.length - 1];
    }
    static now() {
        return Math.round(new Date().getTime() / 1000);
    }
}
// Let's define that our "genesis" block as an empty block, starting from the January 1, 1970 (midnight "UTC").
Blockchain.GENESIS_BLOCK = new Block(0, [], 0, 0, "fiat lux");
Blockchain.DIFFICULTY = 4;
Blockchain.TARGET = Math.pow(2, (256 - Blockchain.DIFFICULTY));
exports.Blockchain = Blockchain;
// Web server
const PORT = 3000;
const app = express();
const nodeId = uuidv4();
const blockchain = new Blockchain(nodeId);
// Set up bodyParser:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
});
// Show all the blocks.
app.get("/blocks", (req, res) => {
    res.json(Serializer_1.serialize(blockchain.blocks));
});
// Show specific block.
app.get("/blocks/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.json("Invalid parameter!");
        res.status(500);
        return;
    }
    if (id >= blockchain.blocks.length) {
        res.json(`Block #${id} wasn't found!`);
        res.status(404);
        return;
    }
    res.json(Serializer_1.serialize(blockchain.blocks[id]));
});
// Show all transactions in the transaction pool.
app.get("/transactions", (req, res) => {
    res.json(Serializer_1.serialize(blockchain.transactionPool));
});
app.post("/transactions", (req, res) => {
    const senderAddress = req.body.senderAddress;
    const recipientAddress = req.body.recipientAddress;
    const value = Number(req.body.value);
    if (!senderAddress || !recipientAddress || !value) {
        res.json("Invalid parameters!");
        res.status(500);
        return;
    }
    blockchain.submitTransaction(senderAddress, recipientAddress, value);
    res.json(`Transaction from ${senderAddress} to ${recipientAddress} was added successfully`);
});
if (!module.parent) {
    app.listen(PORT);
    console.log(`Web server started on port ${PORT}. Node ID is: ${nodeId}`);
}
//# sourceMappingURL=10_initial_web_api.js.map