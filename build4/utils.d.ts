/// <reference types="express" />
import * as express from "express";
import { Blockchain } from "./blockchain";
import { Node } from "./node";
import { Transaction } from "./transaction";
import { Block } from "./block";
export declare const getNodeAndAccountIndex: (nodes: Node[], nodeId: string, nodeAddress: string, errMsg: string, type?: string) => {
    nodeIdx: number;
    accountIdx: number;
};
export declare const getNodeAndContractIndex: (nodes: Node[], nodeId: string, contractAddress: string, errMsg: string) => {
    nodeIdx: number;
    accountIdx: number;
};
export declare const postAccountUpdates: (blockchain: Blockchain, nodeId: string) => {
    success: boolean;
    msg: string;
};
export declare const getConsensus: (req: express.Request, res: express.Response, blockchain: Blockchain, nodeId: string) => void;
export declare const getDigitalSignature: (nodes: Node[], nodeId: string, senderAddress: string, action: string) => any;
export declare const verifyDigitalSignature: (nodes: Node[], nodeId: string, senderAddress: string, signature: string, action: string) => boolean;
export declare const verifyNonce: (nodes: Node[], nodeId: string, nodeAddress: string, txNonce: number) => boolean;
export declare const getBalance: (nodes: Node[], nodeId: string, nodeAddress: string) => any;
export declare const getNodesRequestingTransactionWithBalance: (nodes: Node[], transactionPool: Transaction[]) => {
    [k: string]: any;
};
export declare const isCrossOriginRequest: (senderNodeId: string, currentNodeId: string) => boolean;
export declare const validateAdequateFunds: (accountsWithBalance: any, txpool: Transaction[]) => Transaction[];
export declare const updateAccountsWithFinalizedTransactions: (blockchain: Blockchain, txpool: any[]) => void;
export declare const isPendingBlockInChain: (pendingBlock: Block, blocks: Block[]) => boolean;
export declare const emittableTXMessagesToTXPostReq: (nodeId: string, emittedTXReqArr: any[]) => Promise<void>;
export declare const getPublicKey: (blockchain: Blockchain, nodeId: string, accountAddress: string) => any;
export declare const encryptPasswords: (blockchain: Blockchain, password: string) => any;
