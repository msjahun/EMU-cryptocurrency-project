"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, transactionType, nonce, senderDigitalSignature) {
        this.senderNodeId = senderNodeId;
        this.senderAddress = senderAddress;
        this.recipientNodeId = recipientNodeId;
        this.recipientAddress = recipientAddress;
        this.value = value;
        this.nonce = nonce;
        this.transactionType = transactionType;
        this.senderDigitalSignature = senderDigitalSignature;
    }
}
exports.Transaction = Transaction;
class ContractTransaction extends Transaction {
    constructor(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, transactionType, nonce, initiaterNode, initiaterAddress, method, args, digitalSignature, data) {
        super(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, transactionType, nonce, digitalSignature);
        this.data = data;
        this.initiaterNode = initiaterNode;
        this.initiaterAddress = initiaterAddress;
        this.method = method;
        this.args = args;
    }
}
exports.ContractTransaction = ContractTransaction;
class AccountTransaction extends Transaction {
    constructor(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, transactionType, nonce, senderDigitalSignature) {
        super(senderNodeId, senderAddress, recipientAddress, recipientNodeId, value, transactionType, nonce, senderDigitalSignature);
    }
}
exports.AccountTransaction = AccountTransaction;
//# sourceMappingURL=transaction.js.map