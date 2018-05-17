"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serializer_1 = require("serializer.ts/Serializer");
const uuidv4 = require("uuid/v4");
const express = require("express");
const bodyParser = require("body-parser");
const url_1 = require("url");
const axios_1 = require("axios");
const parseArgs = require("minimist");
const actions_1 = require("./actions");
const transaction_1 = require("./transaction");
const node_1 = require("./node");
const blockchain_1 = require("./blockchain");
const utils_1 = require("./utils");
// Web server:
const ARGS = parseArgs(process.argv.slice(2));
const PORT = ARGS.port || 3002;
const app = express();
const nodeId = ARGS.id || uuidv4();
const blockchain = new blockchain_1.Blockchain(nodeId);
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
app.post("/blocks/mine", (req, res) => {
    // Mine the new block.
    const newBlock = blockchain.createBlock();
    res.json(`Mined new block #${newBlock.blockNumber}`);
});
app.post("/createAccount", (req, res) => {
    const { address, balance, account_type, nodeId } = req.body;
    const createdNode = blockchain.createAccount(address, balance, account_type, nodeId);
    // Verify creation of Node
    if (!createdNode) {
        res.json(`CreateAccount Failed to create node with address ${address}, balance ${balance}, type ${account_type} `);
        res.status(404);
        return;
    }
    // Success msg
    res.json(`Creation of account ${address} of type ${account_type} with balance ${balance}`);
});
app.get("/publicKey/:node/:accountName", (req, res) => {
    const { node, accountName } = req.params;
    console.log(`Account name: ${accountName}`);
    const pubkey = utils_1.getPublicKey(blockchain, node, accountName);
    res.json(pubkey);
});
app.get("/encryptPassword/:password", (req, res) => {
    const { password } = req.params;
    const encryptedPasswordDictionary = utils_1.encryptPasswords(blockchain, password);
    res.json(encryptedPasswordDictionary);
});
app.post("/updateAccountData", (req, res) => {
    const { sourceOfTruthNode, nodes } = req.body;
    blockchain.updateAccounts(nodes, sourceOfTruthNode);
    res.json(`Updating accounts in ${nodeId} data with accounts in node ${sourceOfTruthNode}`);
});
app.post("/propogateAccountCreation", (req, res) => {
    const { address, balance, account_type, nodeId } = req.body;
    const createdNode = blockchain.createAccount(address, balance, account_type, nodeId);
    // Verify creation of node
    if (!createdNode) {
        res.json(`PropogateAccountCreation failed to create node with address ${address}, balance ${balance}, type ${account_type} `);
        res.status(404);
        return;
    }
    // Propogate account to rest of Nodes on network
    const requests = blockchain.nodes
        .filter(node => node.id !== nodeId)
        .map(node => axios_1.default.post(`${node.url}createAccount`, {
        address: address,
        balance: balance,
        nodeId: nodeId,
        account_type: account_type
    }));
    axios_1.default
        .all(requests)
        .then(axios_1.default.spread((...responses) => responses.map(res => res.data)))
        .catch(err => {
        console.log(err);
        res.status(500);
        res.json(err);
        return;
    });
    res.status(500);
    console.log(`Created:
      Account:${address}
      Type: ${account_type}
      Balance: ${balance}`);
    res.end();
});
app.get("/contracts", (req, res) => {
    const contracts = blockchain.getContracts();
    res.json(contracts);
});
app.post("/deployContract", (req, res) => {
    const { contractName, contract, value, type } = req.body;
    blockchain.submitContract(contractName, value, type, contract);
    res.end();
});
app.post("/propogateContract", (req, res) => {
    const { address, value, type, data } = req.body;
    blockchain.submitContract(address, value, type, data);
    const requests = blockchain.nodes
        .filter(node => node.id !== nodeId)
        .map(node => axios_1.default.post(`${node.url}deployContract`, {
        contractName: address,
        contract: data,
        value: value,
        type: type
    }));
    if (requests.length === 0) {
        res.json("There are no nodes to sync with!");
        res.status(404);
        return;
    }
    axios_1.default
        .all(requests)
        .then(axios_1.default.spread((...responses) => responses.map(res => console.log(res.data))))
        .catch(err => {
        console.log(err);
        res.status(500);
        res.json(err);
        return;
    });
    res.json(`Successfully deployed ${address} contract`);
});
app.put("/mutateContract/:address", (req, res) => {
    const { address } = req.params;
    const { method, initiaterNode, initiaterAddress, value, action, args } = req.body;
    const { nodeIdx, accountIdx } = utils_1.getNodeAndContractIndex(blockchain.nodes, nodeId, address, "Could not find contract node or address");
    const digitalSignature = utils_1.getDigitalSignature(blockchain.nodes, initiaterNode, initiaterAddress, action);
    // Add transaction to blockchain
    const transaction = blockchain.submitTransaction(new transaction_1.ContractTransaction(nodeId, address, "NONE", "NONE", 100, actions_1.ACTIONS.TRANSACTION_CONTRACT_ACCOUNT, blockchain.nodes[nodeIdx].accounts[accountIdx].nonce, initiaterNode, initiaterAddress, method, args, digitalSignature), false);
    res.end();
});
// Show all transactions in the transaction pool.
app.get("/transactions", (req, res) => {
    res.json(Serializer_1.serialize(blockchain.transactionPool));
});
app.post("/transactions", (req, res) => {
    const { senderNodeId, senderAddress, recipientAddress, recipientNodeId, action, method, data } = req.body;
    // if (isCrossOriginRequest(senderNodeId, nodeId)) {
    //   console.log(
    //     `Cross Origin Requests are prohibited ${senderNodeId} ${nodeId}`
    //   );
    //   return;
    // }
    const value = Number(req.body.value);
    if (!senderNodeId ||
        !senderAddress ||
        !recipientAddress ||
        !recipientNodeId ||
        !value ||
        !action) {
        res.json("Invalid parameters!");
        res.status(500);
        return;
    }
    const digitalSignature = utils_1.getDigitalSignature(blockchain.nodes, senderNodeId, senderAddress, action);
    const { nodeIdx, accountIdx } = utils_1.getNodeAndAccountIndex(blockchain.nodes, senderNodeId, senderAddress, `POST: /transactions: senderAddress ${senderAddress} is invalid...`);
    const newAccntTx = blockchain.nodes[nodeIdx].accounts[accountIdx].createTransaction(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, action, digitalSignature);
    blockchain.submitTransaction(newAccntTx, true);
    res.end();
});
app.get("/nodes", (req, res) => {
    res.json(Serializer_1.serialize(blockchain.nodes));
});
app.post("/nodes", (req, res) => {
    const id = req.body.id;
    const url = new url_1.URL(req.body.url);
    if (!id || !url) {
        res.json("Invalid parameters!");
        res.status(500);
        return;
    }
    const node = new node_1.Node(id, url);
    if (blockchain.register(node)) {
        res.json(`Registered node: ${node}`);
    }
    else {
        res.json(`Node ${node} already exists!`);
        res.status(500);
    }
});
app.put("/nodes/consensus", (req, res) => {
    // Fetch the state of the other nodes.
    utils_1.getConsensus(req, res, blockchain, nodeId);
    res.end();
});
// Start server
if (!module.parent) {
    app.listen(PORT);
    console.log(`Web server started on port ${PORT}. Node ID is: ${nodeId}`);
}
//# sourceMappingURL=server.js.map