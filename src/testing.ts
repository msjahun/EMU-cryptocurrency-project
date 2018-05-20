// Show all the blocks.

app.get("/blocks", (req: express.Request, res: express.Response) => {
  res.json(serialize(blockchain.blocks));
});


// Show specific block.
app.get("/blocks/:id", (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  // id is not a number return 505 error internal server error
  if (isNaN(id)) {
    res.json("Invalid parameter!");
    res.status(500);
    return;
  }

  //if id is greater of equal to length fo blocks not found error
  if (id >= blockchain.blocks.length) {
    res.json(`Block #${id} wasn't found!`);
    res.status(404);
    return;
  }
//return json
  res.json(serialize(blockchain.blocks[id]));
});


//for mining(generating proof of work) new blocks using nonce
app.post("/blocks/mine", (req: express.Request, res: express.Response) => {
  // Mine the new block.
  const newBlock = blockchain.createBlock();

  res.json(`Mined new block #${newBlock.blockNumber}`);
});


//create new account
app.post("/createAccount", (req: express.Request, res: express.Response) => {
  const { address, balance, account_type, nodeId } = req.body;
  const createdNode = blockchain.createAccount(
    address,
    balance,
    account_type,
    nodeId
  );

  // Verify creation of Node
  if (!createdNode) {
    res.json(
      `CreateAccount Failed to create node with address ${address}, balance ${balance}, type ${account_type} `
    );
    res.status(404);
    return;
  }

  // Success msg
  res.json(
    `Creation of account ${address} of type ${account_type} with balance ${balance}`
  );
});

//return the public key of an account that is created
app.get(
  "/publicKey/:node/:accountName",
  (req: express.Request, res: express.Response) => {
    const { node, accountName } = req.params;
    console.log(`Account name: ${accountName}`);
    const pubkey = getPublicKey(blockchain, node, accountName);
    res.json(pubkey);
  }
);


app.get(
  "/encryptPassword/:password",
  (req: express.Request, res: express.Response) => {
    const { password } = req.params;
    const encryptedPasswordDictionary = encryptPasswords(blockchain, password);
    res.json(encryptedPasswordDictionary);
  }
);

app.post(
  "/updateAccountData",
  (req: express.Request, res: express.Response) => {
    const { sourceOfTruthNode, nodes } = req.body;
    blockchain.updateAccounts(nodes, sourceOfTruthNode);
    res.json(
      `Updating accounts in ${nodeId} data with accounts in node ${sourceOfTruthNode}`
    );
  }
);


//copies of accounts are created in other nodes
app.post(
  "/propogateAccountCreation",
  (req: express.Request, res: express.Response) => {
    const { address, balance, account_type, nodeId } = req.body;
    const createdNode = blockchain.createAccount(
      address,
      balance,
      account_type,
      nodeId
    );

    // Verify creation of node
    if (!createdNode) {
      res.json(
        `PropogateAccountCreation failed to create node with address ${address}, balance ${balance}, type ${account_type} `
      );
      res.status(404);
      return;
    }

    // Propogate account to rest of Nodes on network
    const requests = blockchain.nodes
      .filter(node => node.id !== nodeId)
      .map(node =>
        axios.post(`${node.url}createAccount`, {
          address: address,
          balance: balance,
          nodeId: nodeId,
          account_type: account_type
        })
      );

    axios
      .all(requests)
      .then(axios.spread((...responses) => responses.map(res => res.data)))
      .catch(err => {
        console.log(err);
        res.status(500);
        res.json(err);
        return;
      });

    res.status(500);
    console.log(
      `Created:
      Account:${address}
      Type: ${account_type}
      Balance: ${balance}`
    );
    res.end();
  }
);



// Show all transactions in the transaction pool.
app.get("/transactions", (req: express.Request, res: express.Response) => {
  res.json(serialize(blockchain.transactionPool));
});


//create a transaction and add it to the blockchain or transaction pool
app.post("/transactions", (req: express.Request, res: express.Response) => {
  const {
    senderNodeId,
    senderAddress,
    recipientAddress,
    recipientNodeId,
    action,
    method,
    data
  } = req.body;
 
  const value = Number(req.body.value);

  if (
    !senderNodeId ||
    !senderAddress ||
    !recipientAddress ||
    !recipientNodeId ||
    !value ||
    !action
  ) {
    res.json("Invalid parameters!");
    res.status(500);
    return;
  }

  const digitalSignature = getDigitalSignature(
    blockchain.nodes,
    senderNodeId,
    senderAddress,
    action
  );

  const { nodeIdx, accountIdx } = getNodeAndAccountIndex(
    blockchain.nodes,
    senderNodeId,
    senderAddress,
    `POST: /transactions: senderAddress ${senderAddress} is invalid...`
  );

  const newAccntTx = blockchain.nodes[nodeIdx].accounts[
    accountIdx
  ].createTransaction(
    senderNodeId,
    senderAddress,
    recipientAddress,
    recipientNodeId,
    value,
    action,
    digitalSignature
  );

  blockchain.submitTransaction(newAccntTx, true);

  res.end();
});




//show all connected nodes(connected computers)
app.get("/nodes", (req: express.Request, res: express.Response) => {
  res.json(serialize(blockchain.nodes));
});


//register a node to the blockchain network
app.post("/nodes", (req: express.Request, res: express.Response) => {
  const id = req.body.id;
  const url = new URL(req.body.url);

  if (!id || !url) {
    res.json("Invalid parameters!");
    res.status(500);
    return;
  }

  const node = new Node(id, url);

  if (blockchain.register(node)) {
    res.json(`Registered node: ${node}`);
  } else {
    res.json(`Node ${node} already exists!`);
    res.status(500);
  }
});

//consensus, after mining, it broadcast the blochain to the network and the longest chain is accepted by all nodes and every node copies it
app.put("/nodes/consensus", (req: express.Request, res: express.Response) => {
  // Fetch the state of the other nodes.
  getConsensus(req, res, blockchain, nodeId);
  res.end();
});