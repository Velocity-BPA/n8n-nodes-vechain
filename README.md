# n8n-nodes-vechain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node package for interacting with the **VeChain blockchain**. This node provides full support for VET/VTHO transfers, VIP-180 tokens, VIP-181 NFTs, smart contracts, multi-clause transactions, fee delegation, and enterprise features.

[![npm version](https://badge.fury.io/js/n8n-nodes-vechain.svg)](https://www.npmjs.com/package/n8n-nodes-vechain)
[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)

## Features

### VeChain Blockchain Support
- **Dual Token Model**: VET (value) + VTHO (energy/gas)
- **Multi-Clause Transactions**: Batch multiple operations in a single atomic transaction
- **Fee Delegation (VIP-191)**: Third-party gas payment support
- **PoA 2.0 Consensus**: 101 authority masternodes with ~10s block time

### Token Standards
- **VIP-180**: Fungible token standard (similar to ERC-20)
- **VIP-181**: Non-fungible token standard (similar to ERC-721)

### Networks Supported
- **Mainnet**: Production VeChain network
- **Testnet**: Test network for development
- **Thor Solo**: Local development node
- **Custom**: Connect to any VeChain-compatible node

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-vechain`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-vechain

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-vechain.git
cd n8n-nodes-vechain

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-vechain

# Restart n8n
n8n start
```

## Credentials Setup

### VeChain Network Credentials

Configure your network connection and wallet:

| Field | Description |
|-------|-------------|
| Network | Select mainnet, testnet, solo, or custom |
| Node URL | Custom node URL (for custom network) |
| Private Key | Your wallet private key (hex format) |
| Delegator URL | Optional fee delegation service URL |

### VeChain API Credentials

For enhanced features and analytics:

| Field | Description |
|-------|-------------|
| API Type | VeChainStats, ToolChain, or VeExplorer |
| API Key | Your API key for the selected service |

### Fee Delegation Credentials

For gas-free transactions:

| Field | Description |
|-------|-------------|
| Delegation Type | Service, Self-Sponsor, or VeChain Energy |
| Service URL | Delegation service endpoint |
| Sponsor Private Key | Key for self-sponsoring |

## Resources & Operations

### VeChain Node (Action Node)

#### Account Operations
- Get Account Info
- Get VET Balance
- Get VTHO Balance
- Validate Address
- Calculate VTHO Generation
- Check if Contract

#### Transaction Operations
- Send VET
- Send VTHO
- Get Transaction
- Get Receipt
- Get Status
- Estimate Gas
- Build Transaction
- Sign Transaction
- Send Raw Transaction
- Multi-Clause Transaction
- Simulate Transaction

#### VET Operations
- Get Balance
- Transfer VET
- Multi-Transfer VET
- Estimate Transfer Fee

#### VTHO Operations
- Get Balance
- Transfer VTHO
- Get Total Supply
- Get Total Burned
- Approve Spending
- Get Allowance
- Calculate Generation

#### VIP-180 Token Operations
- Get Token Info
- Get Balance
- Transfer
- Approve
- Get Allowance
- Transfer From
- Get Total Supply

#### VIP-181 NFT Operations
- Get Collection Info
- Get Owner
- Get Balance
- Get Token URI
- Get Tokens by Owner
- Transfer
- Safe Transfer
- Approve
- Set Approval For All
- Get Approved
- Is Approved For All

#### Smart Contract Operations
- Read (Call)
- Write (Send)
- Deploy
- Get Code
- Get Storage
- Encode Function
- Decode Result
- Simulate
- Estimate Gas

#### Block Operations
- Get Block
- Get Best Block
- Get Finalized Block
- Get Genesis Block
- Get Block Transactions
- Get Block Height
- Check Finality
- Get Block Range

#### Utility Operations
- Convert VET Units
- Convert VTHO Units
- Validate Address
- Generate Keypair
- Generate from Mnemonic
- Get Address from Private Key
- Sign Message
- Verify Signature
- Hash Data
- Get Block Ref
- Get Network Info
- Calculate VTHO Cost
- Checksum Address

## Trigger Node

### VeChain Trigger

Monitor blockchain events in real-time:

- **New Block**: Trigger on new blocks
- **Transaction Confirmed**: Monitor specific transactions
- **VET Transfer**: Watch VET movements
- **VTHO Transfer**: Watch VTHO movements
- **VIP-180 Transfer**: Monitor token transfers
- **VIP-181 Transfer**: Monitor NFT transfers
- **Contract Event**: Watch for smart contract events

## Usage Examples

### Send VET

```javascript
// Configuration
{
  "resource": "vet",
  "operation": "transfer",
  "toAddress": "0x...",
  "amount": "100"
}
```

### Get Token Balance

```javascript
// Configuration
{
  "resource": "vip180",
  "operation": "getBalance",
  "contractAddress": "0x0000000000000000000000000000456E65726779",
  "ownerAddress": "0x..."
}
```

### Multi-Clause Transaction

```javascript
// Send VET to multiple recipients in one transaction
{
  "resource": "vet",
  "operation": "multiTransfer",
  "recipients": [
    { "address": "0x...", "amount": "10" },
    { "address": "0x...", "amount": "20" },
    { "address": "0x...", "amount": "30" }
  ]
}
```

### Read Smart Contract

```javascript
// Call a contract function
{
  "resource": "contract",
  "operation": "read",
  "contractAddress": "0x...",
  "abi": "[...]",
  "functionName": "balanceOf",
  "parameters": "[\"0x...\"]"
}
```

### Calculate VTHO Generation

```javascript
// Calculate VTHO generated by VET holdings
{
  "resource": "account",
  "operation": "calculateVthoGeneration",
  "vetAmount": "1000000",
  "timePeriod": "month"
}
```

## VeChain Concepts

### Dual Token Model

VeChain uses two tokens:
- **VET (VeChain Token)**: The value token for transfers and staking
- **VTHO (VeThor Token)**: The energy token used for gas fees

VET generates VTHO over time at a rate of **0.000432 VTHO per VET per day** (5×10⁻⁹ per second).

### Multi-Clause Transactions

Unlike Ethereum, VeChain supports multiple operations in a single transaction:
- Send to multiple recipients
- Interact with multiple contracts
- Mix different operation types
- Atomic execution (all or nothing)

### Fee Delegation (VIP-191)

Third parties can pay gas fees on behalf of users:
- Improves user experience
- Enables gas-free applications
- Supports enterprise use cases

### Block Finality

VeChain PoA 2.0 provides:
- ~10 second block time
- ~12 blocks to finality (~120 seconds)
- Two-phase commit confirmation
- 101 authority masternodes

## Networks

| Network | Chain Tag | Node URL |
|---------|-----------|----------|
| Mainnet | 0x4a (74) | https://mainnet.veblocks.net |
| Testnet | 0x27 (39) | https://testnet.veblocks.net |
| Thor Solo | 0xf6 (246) | http://localhost:8669 |

## Error Handling

### Common Errors

**"Invalid private key"**
- Ensure your private key is in hex format
- Remove the `0x` prefix if present
- Key should be 64 characters (32 bytes)

**"Insufficient VTHO"**
- Check your VTHO balance
- VTHO is required for gas fees
- VET generates VTHO over time

**"Transaction reverted"**
- Check contract requirements
- Verify you have sufficient balances
- Use simulate before sending

**"Network timeout"**
- Check node URL is correct
- Try a different node
- Check network connectivity

## Security Best Practices

1. **Never share private keys** - Store them securely
2. **Use testnet for development** - Test thoroughly before mainnet
3. **Validate addresses** - Always validate before sending
4. **Simulate transactions** - Use simulate before sending value
5. **Check balances** - Ensure sufficient VET and VTHO

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
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

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-vechain/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-vechain/discussions)

## Acknowledgments

- [VeChain Foundation](https://www.vechain.org/) - For the VeChain blockchain
- [n8n](https://n8n.io/) - For the workflow automation platform
- [thor-devkit](https://github.com/vechain/thor-devkit.js) - VeChain SDK

---

## Changelog

### v1.0.0
- Initial release
- Full VeChain blockchain support
- VET/VTHO operations
- VIP-180 token support
- VIP-181 NFT support
- Smart contract interactions
- Multi-clause transactions
- Fee delegation support
- Block and event monitoring
- Utility functions
