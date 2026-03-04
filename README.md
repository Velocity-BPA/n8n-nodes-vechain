# n8n-nodes-vechain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node that provides seamless integration with the VeChain blockchain network. This node includes 6 comprehensive resources (Blocks, Transactions, Accounts, Tokens, Contracts, Events) enabling developers to build powerful blockchain automation workflows for supply chain, IoT, and enterprise applications on VeChain's dual-token ecosystem.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![VeChain](https://img.shields.io/badge/VeChain-Thor-00d4ff)
![Blockchain](https://img.shields.io/badge/Blockchain-Enterprise-green)
![Supply Chain](https://img.shields.io/badge/Supply%20Chain-Ready-orange)

## Features

- **Block Operations** - Query block data, retrieve block details, and monitor blockchain height
- **Transaction Management** - Send transactions, check transaction status, and retrieve transaction history
- **Account Operations** - Get account balances, manage VET/VTHO tokens, and monitor account activity
- **Token Integration** - Interact with VIP-180 tokens, check balances, and perform token transfers
- **Smart Contract Interaction** - Deploy contracts, call contract methods, and monitor contract events
- **Event Monitoring** - Subscribe to blockchain events, filter logs, and track contract emissions
- **Dual-Token Support** - Full support for VET and VTHO token operations
- **Enterprise Ready** - Built for supply chain and IoT use cases with robust error handling

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-vechain`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-vechain
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-vechain.git
cd n8n-nodes-vechain
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-vechain
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | VeChain Thor node API key for authenticated requests | Yes |
| Network | Network selection (MainNet/TestNet) | Yes |
| Node URL | Custom VeChain Thor node URL (optional) | No |
| Private Key | Wallet private key for transaction signing | No* |

*Required only for operations that send transactions

## Resources & Operations

### 1. Blocks

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by number or hash |
| Get Latest Block | Get the most recent block on the blockchain |
| Get Block Range | Fetch multiple blocks within a specified range |
| Get Block Transactions | List all transactions in a specific block |

### 2. Transactions

| Operation | Description |
|-----------|-------------|
| Send Transaction | Broadcast a new transaction to the network |
| Get Transaction | Retrieve transaction details by hash |
| Get Transaction Receipt | Get transaction execution receipt and logs |
| Get Account Transactions | List transactions for a specific account |
| Estimate Gas | Calculate gas requirements for a transaction |

### 3. Accounts

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve VET balance for an account |
| Get Energy Balance | Get VTHO (energy) balance for an account |
| Get Account Details | Fetch comprehensive account information |
| Get Code | Retrieve smart contract code for contract accounts |
| Get Storage | Query contract storage values |

### 4. Tokens

| Operation | Description |
|-----------|-------------|
| Get Token Balance | Check VIP-180 token balance for an account |
| Transfer Tokens | Send VIP-180 tokens between accounts |
| Get Token Info | Retrieve token metadata and specifications |
| Get Token Holders | List accounts holding a specific token |
| Get Token Transfers | Query token transfer history |

### 5. Contracts

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy a new smart contract to the blockchain |
| Call Method | Execute a smart contract method |
| Query Method | Read data from a smart contract (view functions) |
| Get Events | Retrieve events emitted by a contract |
| Get Contract Info | Fetch contract metadata and ABI |

### 6. Events

| Operation | Description |
|-----------|-------------|
| Get Logs | Query blockchain logs with filtering options |
| Subscribe to Events | Monitor real-time blockchain events |
| Get Event History | Retrieve historical events for analysis |
| Filter Events | Apply complex filters to event queries |
| Parse Event Data | Decode event data using ABI specifications |

## Usage Examples

```javascript
// Get latest block information
const latestBlock = {
  "resource": "blocks",
  "operation": "getLatestBlock",
  "parameters": {}
};

// Send VET transaction
const sendTransaction = {
  "resource": "transactions",
  "operation": "sendTransaction",
  "parameters": {
    "to": "0x7567d83b7b8d80addcb281a71d54fc7b3364ffed",
    "amount": "1000000000000000000", // 1 VET in wei
    "data": "0x"
  }
};

// Check token balance
const tokenBalance = {
  "resource": "tokens",
  "operation": "getTokenBalance",
  "parameters": {
    "tokenAddress": "0x0000000000000000000000000000456E65726779",
    "accountAddress": "0x7567d83b7b8d80addcb281a71d54fc7b3364ffed"
  }
};

// Query contract events
const contractEvents = {
  "resource": "events",
  "operation": "getLogs",
  "parameters": {
    "address": "0x0000000000000000000000000000456E65726779",
    "fromBlock": "0x1000000",
    "toBlock": "latest",
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
  }
};
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has required permissions |
| Insufficient Balance | Account lacks sufficient VET or VTHO for transaction | Check account balance and ensure adequate funds |
| Gas Limit Exceeded | Transaction requires more gas than specified limit | Increase gas limit or optimize contract interaction |
| Network Timeout | Request to VeChain node timed out | Check network connectivity and node availability |
| Invalid Address Format | Provided address doesn't match VeChain format | Ensure address is valid 42-character hex string |
| Contract Execution Failed | Smart contract call reverted or failed | Review contract method parameters and state requirements |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-vechain/issues)
- **VeChain Documentation**: [VeChain Thor Documentation](https://docs.vechain.org/)
- **VeChain Community**: [VeChain Official Discord](https://discord.gg/vechain)