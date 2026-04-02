# n8n-nodes-vechain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for integrating with VeChain blockchain networks. This node provides 6 comprehensive resources for interacting with VeChain's enterprise-grade blockchain platform, enabling account management, block exploration, transaction processing, event log monitoring, node information retrieval, and smart contract interactions.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![VeChain](https://img.shields.io/badge/VeChain-Blockchain-00d4aa)
![VET](https://img.shields.io/badge/VET-VTHO-15bdff)
![Web3](https://img.shields.io/badge/Web3-Enterprise-purple)

## Features

- **Account Management** - Query account balances, energy (VTHO), and transaction history
- **Block Explorer** - Retrieve block details, headers, and validate blockchain data
- **Transaction Processing** - Send transactions, check status, and decode transaction data
- **Event Log Monitoring** - Filter and retrieve smart contract event logs and emissions
- **Node Information** - Access network status, peer information, and blockchain metrics
- **Smart Contract Interaction** - Call contract methods, deploy contracts, and manage contract state
- **Multi-Network Support** - Connect to MainNet, TestNet, and custom VeChain networks
- **Enterprise Features** - Built for production environments with comprehensive error handling

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
| API Key | VeChain node API key for authentication | Yes |
| Network URL | VeChain network endpoint (MainNet/TestNet/Custom) | Yes |
| Network Type | Select MainNet, TestNet, or Custom network | Yes |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account information including VET and VTHO balances |
| Get Account Code | Get bytecode for smart contract accounts |
| Get Account Storage | Retrieve storage data from account at specific key |
| List Transactions | Get transaction history for an account |
| Get Energy | Retrieve VTHO (energy) balance and calculations |

### 2. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve complete block information by ID or number |
| Get Block Header | Get block header data without transactions |
| Get Latest Block | Retrieve the most recent block |
| Get Block Range | Fetch multiple blocks within a specified range |
| Validate Block | Verify block integrity and signatures |

### 3. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by ID |
| Get Transaction Receipt | Get transaction execution receipt and logs |
| Send Transaction | Broadcast a signed transaction to the network |
| Estimate Gas | Calculate gas requirements for transaction execution |
| Decode Transaction | Parse and decode transaction input data |
| Get Transaction Status | Check current status of pending transactions |

### 4. Log

| Operation | Description |
|-----------|-------------|
| Get Logs | Retrieve event logs with filtering options |
| Filter Event Logs | Search logs by contract address, topics, and block range |
| Get Transfer Logs | Retrieve VET and token transfer events |
| Decode Event Log | Parse and decode smart contract event data |
| Monitor Logs | Real-time log monitoring with webhook support |

### 5. Node

| Operation | Description |
|-----------|-------------|
| Get Node Info | Retrieve node status and network information |
| Get Peers | List connected peer nodes and network topology |
| Get Chain Info | Get blockchain statistics and chain head information |
| Check Sync Status | Verify node synchronization status |
| Get Network Health | Retrieve network performance metrics |

### 6. Contract

| Operation | Description |
|-----------|-------------|
| Call Method | Execute read-only smart contract methods |
| Send Method | Execute state-changing contract methods |
| Deploy Contract | Deploy new smart contracts to the network |
| Get Contract Info | Retrieve contract details and metadata |
| Estimate Method Gas | Calculate gas costs for contract method execution |
| Decode Method Data | Parse contract method input and output data |

## Usage Examples

```javascript
// Get account VET and VTHO balances
{
  "resource": "account",
  "operation": "getAccount",
  "address": "0x8384738c995d49c5b692560ae688fc8b51af1059",
  "returnAll": true
}
```

```javascript
// Retrieve latest block information
{
  "resource": "block",
  "operation": "getLatestBlock",
  "expanded": true,
  "includeTransactions": true
}
```

```javascript
// Monitor contract event logs
{
  "resource": "log",
  "operation": "filterEventLogs",
  "contractAddress": "0x0000000000000000000000000000456e65726779",
  "fromBlock": "latest",
  "limit": 100
}
```

```javascript
// Call smart contract method
{
  "resource": "contract",
  "operation": "callMethod",
  "contractAddress": "0x89827f7bb951fd8a56f8ef13c5bfeb82d0ca8db2",
  "methodABI": "function name() returns (string)",
  "parameters": []
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key and network endpoint configuration |
| Network Timeout | Request exceeded timeout limit | Check network connectivity and try again |
| Insufficient Gas | Transaction gas limit too low | Increase gas limit or use gas estimation |
| Invalid Address | Malformed or invalid VeChain address | Verify address format (0x + 40 hex characters) |
| Block Not Found | Requested block doesn't exist | Check block number/hash and network sync status |
| Contract Error | Smart contract execution failed | Review contract method parameters and state |

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
- **VeChain Documentation**: [VeChain Developer Portal](https://docs.vechain.org/)
- **VeChain Community**: [VeChain Official Forum](https://www.vechain.org/community/)