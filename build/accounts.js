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
const fs = require("fs");
const path = require("path");
const ursa = require("ursa");
const generate_rsa_keys_1 = require("./asymmetric_encryption/generate_rsa_keys");
const transaction_1 = require("./transaction");
exports.CONTRACT_ACCOUNT = "CONTRACT_ACCOUNT";
exports.EXTERNAL_ACCOUNT = "EXTERNAL_ACCOUNT";
class Account {
    constructor(address, balance, type) {
        this.address = address;
        this.balance = balance;
        this.type = type;
        this.nonce = 0;
    }
}
exports.Account = Account;
class ExternalAccount extends Account {
    constructor(address, balance, type, id) {
        super(address, balance, type);
        this.storagePath = path.resolve(__dirname, "../", "RSAKeys", `${address}Keys`);
        this.createRSAKeys(address);
    }
    createTransaction(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, action, digitalSignature) {
        return new transaction_1.AccountTransaction(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, action, this.nonce, digitalSignature);
    }
    createRSAKeys(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const { privpem, pubpem } = yield generate_rsa_keys_1.generateAccountKeys(address);
            this.privateKey = ursa.createPrivateKey(fs.readFileSync(`${this.storagePath}/privkey.pem`));
            this.publicKey = ursa.createPublicKey(fs.readFileSync(`${this.storagePath}/pubkey.pem`));
        });
    }
    getPublicKey() {
        return fs.readFileSync(`${this.storagePath}/pubkey.pem`, "utf8");
    }
    // TODO: Encrypting usually work with someone elses key.. This is weird
    encryptActionRequest(action) {
        return this.publicKey.encrypt(action, "utf8", "base64");
    }
    decryptActionRequest(action) {
        return this.privateKey.decrypt(action, "base64", "utf8");
    }
    createDigitalSignature(action) {
        return this.privateKey.hashAndSign("sha256", Buffer.from(action, "utf8"), "utf8", "base64");
    }
    verifyDigitalSignature(action, signature) {
        return this.publicKey.hashAndVerify("sha256", Buffer.from(action, "utf8"), signature, "base64");
    }
}
exports.ExternalAccount = ExternalAccount;
class ContractAccount extends Account {
    constructor(address, balance, type, data) {
        super(address, balance, type);
        this.data = data;
    }
    // Stringifying contract to JSON
    static replacer(key, value) {
        if (typeof value === "function") {
            return value.toString();
        }
        return value;
    }
    // Parse stringified contract
    static reviver(key, value) {
        if (typeof value === "string" && value.indexOf("function ") === 0) {
            let functionTemplate = `(${value})`;
            return eval(functionTemplate);
        }
        return value;
    }
    static parseContractData(blockchain, nodeIdx, contractIdx, nonce) {
        if (nonce === 0) {
            return eval(blockchain.nodes[nodeIdx].accounts[contractIdx].data);
        }
        return JSON.parse(blockchain.nodes[nodeIdx].accounts[contractIdx].data, this.reviver);
    }
    static updateContractState(blockchain, nodeIdx, contractIdx, parsedContract) {
        // Update Contract State
        blockchain.nodes[nodeIdx].accounts[contractIdx].data = JSON.stringify(parsedContract, this.replacer);
        blockchain.nodes[nodeIdx].accounts[contractIdx].nonce++;
    }
}
exports.ContractAccount = ContractAccount;
//# sourceMappingURL=accounts.js.map