"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Serializer_1 = require("serializer.ts/Serializer");
const accounts_1 = require("./accounts");
const actions_1 = require("./actions");
const block_1 = require("./block");
exports.getNodeAndAccountIndex = (nodes, nodeId, nodeAddress, errMsg, type) => {
    if (type === actions_1.ACTIONS.TRANSACTION_CONTRACT_ACCOUNT) {
        return exports.getNodeAndContractIndex(nodes, nodeId, nodeAddress, errMsg);
    }
    const nodeIdx = nodes.findIndex(node => node.id === nodeId);
    if (nodeIdx === -1) {
        throw new Error(`${errMsg} -> could not find nodeIdx of ${nodeId}`);
    }
    const accountIdx = nodes[nodeIdx].accounts.findIndex(accnt => accnt.address === nodeAddress);
    if (accountIdx === -1) {
        throw new Error(`${errMsg} -> could not find accountIdx of ${nodeAddress} and nodeIdx ${nodeId}`);
    }
    return {
        nodeIdx,
        accountIdx
    };
};
exports.getNodeAndContractIndex = (nodes, nodeId, contractAddress, errMsg) => {
    const nodeIdx = nodes.findIndex(node => node.id === nodeId);
    if (nodeIdx === -1) {
        throw new Error(`utils.ts: getNodeAndContractIndex: ${errMsg} -> could not find accountIdx of ${nodeId}`);
    }
    // Find contract by address
    const accountIdx = nodes[nodeIdx].accounts.findIndex(account => account.address === contractAddress && account.type === accounts_1.CONTRACT_ACCOUNT);
    if (accountIdx === -1) {
        throw new Error(`utils.ts: getNodeAndContractIndex: ${errMsg} -> could not find contractIndex of ${contractAddress}`);
    }
    return {
        nodeIdx,
        accountIdx
    };
};
exports.postAccountUpdates = (blockchain, nodeId) => {
    const requests = blockchain.nodes
        .filter(node => node.id !== nodeId)
        .map(node => axios_1.default.post(`${node.url}updateAccountData`, {
        sourceOfTruthNode: nodeId,
        nodes: blockchain.nodes
    }));
    if (requests.length === 0) {
        return {
            success: true,
            msg: "Utils: Post account updates, No nodes to update"
        };
    }
    axios_1.default
        .all(requests)
        .then(axios_1.default.spread((...responses) => {
        responses.map(res => console.log(res.data));
    }))
        .catch(err => {
        throw new Error(`Utils.ts: postAccountUpdates failed ${err}`);
    });
    return {
        success: true,
        msg: "Utils.ts: Post accounts updates, successfully updated all nodes"
    };
};
exports.getConsensus = (req, res, blockchain, nodeId) => {
    let propogateRes;
    const requests = blockchain.nodes
        .filter(node => node.id !== nodeId)
        .map(node => axios_1.default.get(`${node.url}blocks`));
    if (requests.length === 0) {
        res.status(404);
        res.json("There are no nodes to sync with!");
        return;
    }
    axios_1.default
        .all(requests)
        .then(axios_1.default.spread((...blockchains) => __awaiter(this, void 0, void 0, function* () {
        if (blockchain.consensus(blockchains.map(res => {
            return Serializer_1.deserialize(block_1.Block, res.data);
        }))) {
            // console.log(`Node ${nodeId} has reached a consensus on a new state.`);
        }
        else {
            console.log(`Node ${nodeId} has the longest chain.`);
            // Propogate new account data to network
            propogateRes = exports.postAccountUpdates(blockchain, nodeId);
        }
    })))
        .catch(err => {
        console.log(err);
        res.status(500);
        res.json(err);
        return;
    });
};
exports.getDigitalSignature = (nodes, nodeId, senderAddress, action) => {
    const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(nodes, nodeId, senderAddress, "Utils: getDigitalSignature ");
    return nodes[nodeIdx].accounts[accountIdx].createDigitalSignature(action);
};
exports.verifyDigitalSignature = (nodes, nodeId, senderAddress, signature, action) => {
    const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(nodes, nodeId, senderAddress, "Utils: verifyDigitalSignature ");
    return !nodes[nodeIdx].accounts[accountIdx].verifyDigitalSignature(action, signature)
        ? false
        : true;
};
exports.verifyNonce = (nodes, nodeId, nodeAddress, txNonce) => {
    const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(nodes, nodeId, nodeAddress, "Utils: verifyNonce ");
    return txNonce === nodes[nodeIdx].accounts[accountIdx].nonce ? true : false;
};
exports.getBalance = (nodes, nodeId, nodeAddress) => {
    const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(nodes, nodeId, nodeAddress, "Utils: getBalance ");
    return nodes[nodeIdx].accounts[accountIdx].balance;
};
exports.getNodesRequestingTransactionWithBalance = (nodes, transactionPool) => {
    const accountBalances = {};
    // Filter transactions to only those moving funds
    const filteredPool = transactionPool.filter(tx => {
        return (tx.transactionType === actions_1.ACTIONS.TRANSACTION_EXTERNAL_ACCOUNT ||
            tx.transactionType === actions_1.ACTIONS.TRANSACTION_CONTRACT_ACCOUNT);
    });
    filteredPool.forEach(tx => {
        const { senderNodeId, senderAddress, transactionType } = tx;
        const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(nodes, senderNodeId, senderAddress, "Utils: getNodesRequestingTransactionWithBalance ", transactionType);
        accountBalances[senderAddress] =
            nodes[nodeIdx].accounts[accountIdx].balance;
        return;
    });
    return accountBalances;
};
exports.isCrossOriginRequest = (senderNodeId, currentNodeId) => {
    return senderNodeId !== currentNodeId;
};
exports.validateAdequateFunds = (accountsWithBalance, txpool) => {
    if (Object.keys(accountsWithBalance).length === 0 &&
        accountsWithBalance.constructor === Object) {
        return txpool;
    }
    return txpool.filter(tx => {
        if (!(tx.transactionType === actions_1.ACTIONS.TRANSACTION_CONTRACT_ACCOUNT) &&
            !(tx.transactionType === actions_1.ACTIONS.TRANSACTION_EXTERNAL_ACCOUNT)) {
            return true; // This does not move funds, no validation needed
        }
        const newBalance = accountsWithBalance[tx.senderAddress] - tx.value;
        if (newBalance < 0) {
            console.log(`${tx.senderAddress} did not have sufficient funds for tx. Removed from tx pool as invalid...`);
            return false;
        }
        accountsWithBalance[tx.senderAddress] -= tx.value;
        return true;
    });
};
exports.updateAccountsWithFinalizedTransactions = (blockchain, txpool) => {
    txpool.forEach(tx => {
        if (!(tx.transactionType === actions_1.ACTIONS.TRANSACTION_CONTRACT_ACCOUNT) &&
            !(tx.transactionType === actions_1.ACTIONS.TRANSACTION_EXTERNAL_ACCOUNT)) {
            return; // This does not move funds, no validation needed
        }
        const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(blockchain.nodes, tx.senderNodeId, tx.senderAddress, "Utils: updateAccountsWithFinalizedTransactions senderIndexes ");
        if (tx.transactionType === actions_1.ACTIONS.TRANSACTION_EXTERNAL_ACCOUNT) {
            // Update sender account information
            blockchain.nodes[nodeIdx].accounts[accountIdx].balance -= tx.value;
            // Update account nonce
            blockchain.nodes[nodeIdx].accounts[accountIdx].nonce++;
            // Update receiver data
            const receiverIndexes = exports.getNodeAndAccountIndex(blockchain.nodes, tx.recipientNodeId, tx.recipientAddress, "Utils: updateAcocuntsWithFinalizedTransaction recipientIndex ");
            blockchain.nodes[receiverIndexes.nodeIdx].accounts[receiverIndexes.accountIdx].balance +=
                tx.value;
        }
        else {
            const parsedContract = accounts_1.ContractAccount.parseContractData(blockchain, nodeIdx, accountIdx, blockchain.nodes[nodeIdx].accounts[accountIdx].nonce);
            if (typeof parsedContract[tx.method] !== "function") {
                throw new Error(`server.ts: mutateContract -> method ${tx.method} does not exist on contract...`);
            }
            const emittedTx = tx.args.length === 0
                ? parsedContract[tx.method]()
                : parsedContract[tx.method](...tx.args);
            if (emittedTx) {
                blockchain.emittedTXMessages.push(emittedTx);
            }
            accounts_1.ContractAccount.updateContractState(blockchain, nodeIdx, accountIdx, parsedContract);
        }
    });
    blockchain.minedTxAwaitingConsensus = [];
};
exports.isPendingBlockInChain = (pendingBlock, blocks) => {
    if (!pendingBlock)
        return false;
    return (blocks.findIndex(block => JSON.stringify(block) === JSON.stringify(pendingBlock)) !== -1);
};
const mapNodeIdToPort = {
    A: "3000",
    B: "3001",
    C: "3002"
};
exports.emittableTXMessagesToTXPostReq = (nodeId, emittedTXReqArr) => __awaiter(this, void 0, void 0, function* () {
    const requests = emittedTXReqArr.map(tx => axios_1.default.post(`http://localhost:${mapNodeIdToPort[nodeId]}/transactions`, tx));
    if (requests.length === 0) {
        return;
    }
    try {
        const res = yield axios_1.default.all(requests);
    }
    catch (e) {
        console.log(`utils.ts: emittableTxMessagesToTXPostReq ${e}`);
    }
    return;
});
exports.getPublicKey = (blockchain, nodeId, accountAddress) => {
    const { nodeIdx, accountIdx } = exports.getNodeAndAccountIndex(blockchain.nodes, nodeId, accountAddress, "Utils: getPublicKeys senderIndexes ");
    return blockchain.nodes[nodeIdx].accounts[accountIdx].getPublicKey();
};
exports.encryptPasswords = (blockchain, password) => {
    const passwordDictionary = {};
    blockchain.nodes.forEach(node => {
        node.accounts.forEach(account => {
            if (account.type === accounts_1.CONTRACT_ACCOUNT) {
                return;
            }
            passwordDictionary[account.address] = {
                nodeId: node.id,
                address: account.address,
                encryptedPassword: account.encryptActionRequest(password)
            };
        });
    });
    return passwordDictionary;
};
//# sourceMappingURL=utils.js.map