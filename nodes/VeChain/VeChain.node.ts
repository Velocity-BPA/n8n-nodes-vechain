/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-vechain/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class VeChain implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'VeChain',
    name: 'vechain',
    icon: 'file:vechain.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the VeChain API',
    defaults: {
      name: 'VeChain',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'vechainApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Log',
            value: 'log',
          },
          {
            name: 'Node',
            value: 'node',
          },
          {
            name: 'Contract',
            value: 'contract',
          },
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Tokens',
            value: 'tokens',
          },
          {
            name: 'Contracts',
            value: 'contracts',
          },
          {
            name: 'Events',
            value: 'events',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['account'] } },
  options: [
    { 
      name: 'Get Account', 
      value: 'getAccount', 
      description: 'Get account details including VET balance, VTHO balance and energy',
      action: 'Get account details'
    },
    { 
      name: 'Get Account Code', 
      value: 'getAccountCode', 
      description: 'Get account bytecode for contract accounts',
      action: 'Get account bytecode'
    },
    { 
      name: 'Get Account Storage', 
      value: 'getAccountStorage', 
      description: 'Get storage value at specific key for contract accounts',
      action: 'Get account storage value'
    }
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['block'] } },
  options: [
    { name: 'Get Best Block', value: 'getBestBlock', description: 'Get the latest block information', action: 'Get best block' },
    { name: 'Get Block', value: 'getBlock', description: 'Get specific block by number or ID', action: 'Get block' },
    { name: 'Get Block Receipts', value: 'getBlockReceipts', description: 'Get all transaction receipts in a block', action: 'Get block receipts' }
  ],
  default: 'getBestBlock',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
		},
	},
	options: [
		{
			name: 'Get Transaction',
			value: 'getTransaction',
			description: 'Get transaction details by transaction ID',
			action: 'Get transaction details',
		},
		{
			name: 'Get Transaction Receipt',
			value: 'getTransactionReceipt',
			description: 'Get transaction receipt and execution results',
			action: 'Get transaction receipt',
		},
		{
			name: 'Send Transaction',
			value: 'sendTransaction',
			description: 'Submit a signed transaction to the network',
			action: 'Send transaction',
		},
	],
	default: 'getTransaction',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['log'],
		},
	},
	options: [
		{
			name: 'Filter Event Logs',
			value: 'filterEventLogs',
			description: 'Filter and retrieve event logs with criteria',
			action: 'Filter event logs',
		},
		{
			name: 'Filter Transfer Logs',
			value: 'filterTransferLogs',
			description: 'Filter VET/VIP-180 token transfer logs',
			action: 'Filter transfer logs',
		},
	],
	default: 'filterEventLogs',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['node'] } },
  options: [
    { name: 'Get Network Peers', value: 'getNetworkPeers', description: 'Get connected peer information', action: 'Get network peers' },
    { name: 'Get Peer Stats', value: 'getPeerStats', description: 'Get network peer statistics', action: 'Get peer stats' }
  ],
  default: 'getNetworkPeers',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['contract'],
		},
	},
	options: [
		{
			name: 'Call Contract',
			value: 'callContract',
			description: 'Execute read-only contract function call',
			action: 'Call contract function',
		},
		{
			name: 'Batch Call Contract',
			value: 'batchCallContract',
			description: 'Execute multiple contract calls in batch',
			action: 'Batch call contract functions',
		},
	],
	default: 'callContract',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
    },
  },
  options: [
    {
      name: 'Get Best Block',
      value: 'getBestBlock',
      description: 'Get the latest block from the blockchain',
      action: 'Get best block',
    },
    {
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get a specific block by number or ID',
      action: 'Get block',
    },
    {
      name: 'Get Multiple Blocks',
      value: 'getMultipleBlocks',
      description: 'Get multiple blocks by their IDs',
      action: 'Get multiple blocks',
    },
  ],
  default: 'getBestBlock',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction by ID',
      action: 'Get transaction',
    },
    {
      name: 'Send Transaction',
      value: 'sendTransaction',
      description: 'Submit a new transaction',
      action: 'Send transaction',
    },
    {
      name: 'Get Transaction Receipt',
      value: 'getTransactionReceipt',
      description: 'Get transaction receipt',
      action: 'Get transaction receipt',
    },
    {
      name: 'Send Batch Transactions',
      value: 'sendBatchTransactions',
      description: 'Submit multiple transactions',
      action: 'Send batch transactions',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Get account information including balance and state',
      action: 'Get account information',
    },
    {
      name: 'Get Account Code',
      value: 'getAccountCode',
      description: 'Get contract bytecode for an account',
      action: 'Get account code',
    },
    {
      name: 'Get Account Storage',
      value: 'getAccountStorage',
      description: 'Get storage value from a specific key',
      action: 'Get account storage',
    },
    {
      name: 'Get Batch Accounts',
      value: 'getBatchAccounts',
      description: 'Get information for multiple accounts at once',
      action: 'Get batch accounts',
    },
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
    },
  },
  options: [
    {
      name: 'Get Token Balance',
      value: 'getTokenBalance',
      description: 'Get token balance for an account',
      action: 'Get token balance',
    },
    {
      name: 'Get Batch Token Balances',
      value: 'getBatchTokenBalances',
      description: 'Get multiple token balances for an account',
      action: 'Get batch token balances',
    },
    {
      name: 'Get Token Transfers',
      value: 'getTokenTransfers',
      description: 'Get token transfer events',
      action: 'Get token transfers',
    },
    {
      name: 'Get Token Holders',
      value: 'getTokenHolders',
      description: 'Get token holder list',
      action: 'Get token holders',
    },
  ],
  default: 'getTokenBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
    },
  },
  options: [
    {
      name: 'Call Contract',
      value: 'callContract',
      description: 'Execute a smart contract method call',
      action: 'Call contract method',
    },
    {
      name: 'Batch Call Contracts',
      value: 'batchCallContracts',
      description: 'Execute multiple contract calls in a batch',
      action: 'Batch call contract methods',
    },
    {
      name: 'Get Contract Events',
      value: 'getContractEvents',
      description: 'Get events emitted by a smart contract',
      action: 'Get contract events',
    },
    {
      name: 'Trace Contract Call',
      value: 'traceContractCall',
      description: 'Debug and trace contract execution',
      action: 'Trace contract call',
    },
  ],
  default: 'callContract',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['events'],
    },
  },
  options: [
    {
      name: 'Get Event Logs',
      value: 'getEventLogs',
      description: 'Get filtered event logs from the blockchain',
      action: 'Get event logs',
    },
    {
      name: 'Get Transfer Logs',
      value: 'getTransferLogs',
      description: 'Get VET/VTHO transfer logs',
      action: 'Get transfer logs',
    },
    {
      name: 'Subscribe to Blocks',
      value: 'subscribeToBlocks',
      description: 'Subscribe to new blocks',
      action: 'Subscribe to blocks',
    },
    {
      name: 'Subscribe to Events',
      value: 'subscribeToEvents',
      description: 'Subscribe to blockchain events',
      action: 'Subscribe to events',
    },
  ],
  default: 'getEventLogs',
},
      // Parameter definitions
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  default: '',
  placeholder: '0x0000000000000000000000000000000000000000',
  description: 'The VeChain account address to query',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccount', 'getAccountCode', 'getAccountStorage']
    }
  }
},
{
  displayName: 'Storage Key',
  name: 'storageKey',
  type: 'string',
  required: true,
  default: '',
  placeholder: '0x0000000000000000000000000000000000000000000000000000000000000000',
  description: 'The storage key to query (32-byte hex string)',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountStorage']
    }
  }
},
{
  displayName: 'Revision',
  name: 'revision',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['block'], operation: ['getBlock'] } },
  default: '',
  description: 'Block number or ID to retrieve',
  placeholder: '12345 or 0x...'
},
{
  displayName: 'Revision',
  name: 'revision',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['block'], operation: ['getBlockReceipts'] } },
  default: '',
  description: 'Block number or ID to get receipts from',
  placeholder: '12345 or 0x...'
},
{
	displayName: 'Transaction ID',
	name: 'transactionId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransaction', 'getTransactionReceipt'],
		},
	},
	default: '',
	description: 'The transaction ID to retrieve information for',
},
{
	displayName: 'Raw Transaction Data',
	name: 'rawTransactionData',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction'],
		},
	},
	default: '',
	description: 'The signed raw transaction data to submit to the network',
},
{
	displayName: 'Additional Headers',
	name: 'additionalHeaders',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			resource: ['transaction'],
		},
	},
	default: {},
	description: 'Additional headers to include in the request',
	options: [
		{
			name: 'headers',
			displayName: 'Header',
			values: [
				{
					displayName: 'Name',
					name: 'name',
					type: 'string',
					default: '',
					description: 'Header name',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					description: 'Header value',
				},
			],
		},
	],
},
{
	displayName: 'Contract Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterEventLogs'],
		},
	},
	default: '',
	description: 'The contract address to filter logs from',
},
{
	displayName: 'Topics',
	name: 'topics',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterEventLogs'],
		},
	},
	default: '[]',
	description: 'Array of topics to filter by (event signatures and indexed parameters)',
},
{
	displayName: 'Range',
	name: 'range',
	type: 'fixedCollection',
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterEventLogs'],
		},
	},
	default: {},
	options: [
		{
			name: 'blockRange',
			displayName: 'Block Range',
			values: [
				{
					displayName: 'From Block',
					name: 'fromBlock',
					type: 'number',
					default: 0,
					description: 'Starting block number',
				},
				{
					displayName: 'To Block',
					name: 'toBlock',
					type: 'number',
					default: 0,
					description: 'Ending block number (0 for latest)',
				},
			],
		},
	],
},
{
	displayName: 'Contract Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterTransferLogs'],
		},
	},
	default: '',
	description: 'The token contract address to filter transfer logs from',
},
{
	displayName: 'Sender Address',
	name: 'sender',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterTransferLogs'],
		},
	},
	default: '',
	description: 'Filter transfers from this sender address',
},
{
	displayName: 'Recipient Address',
	name: 'recipient',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterTransferLogs'],
		},
	},
	default: '',
	description: 'Filter transfers to this recipient address',
},
{
	displayName: 'Range',
	name: 'range',
	type: 'fixedCollection',
	displayOptions: {
		show: {
			resource: ['log'],
			operation: ['filterTransferLogs'],
		},
	},
	default: {},
	options: [
		{
			name: 'blockRange',
			displayName: 'Block Range',
			values: [
				{
					displayName: 'From Block',
					name: 'fromBlock',
					type: 'number',
					default: 0,
					description: 'Starting block number',
				},
				{
					displayName: 'To Block',
					name: 'toBlock',
					type: 'number',
					default: 0,
					description: 'Ending block number (0 for latest)',
				},
			],
		},
	],
},
{
	displayName: 'Contract Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['contract'],
			operation: ['callContract'],
		},
	},
	default: '',
	placeholder: '0x0000000000000000000000000000456e65726779',
	description: 'The contract address to call',
},
{
	displayName: 'Call Data',
	name: 'calldata',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['contract'],
			operation: ['callContract'],
		},
	},
	default: '',
	placeholder: '0x70a08231000000000000000000000000abc...',
	description: 'The encoded function call data',
},
{
	displayName: 'Caller Address',
	name: 'caller',
	type: 'string',
	required: false,
	displayOptions: {
		show: {
			resource: ['contract'],
			operation: ['callContract'],
		},
	},
	default: '',
	placeholder: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
	description: 'The address from which the call is made (optional)',
},
{
	displayName: 'Clauses',
	name: 'clauses',
	type: 'collection',
	typeOptions: {
		multipleValues: true,
	},
	required: true,
	displayOptions: {
		show: {
			resource: ['contract'],
			operation: ['batchCallContract'],
		},
	},
	default: {},
	options: [
		{
			displayName: 'Address',
			name: 'to',
			type: 'string',
			default: '',
			placeholder: '0x0000000000000000000000000000456e65726779',
			description: 'The contract address to call',
		},
		{
			displayName: 'Value',
			name: 'value',
			type: 'string',
			default: '0x0',
			description: 'Amount of VET to transfer (in hex)',
		},
		{
			displayName: 'Data',
			name: 'data',
			type: 'string',
			default: '',
			placeholder: '0x70a08231000000000000000000000000abc...',
			description: 'The encoded function call data',
		},
	],
	description: 'Array of contract calls to execute in batch',
},
{
  displayName: 'Revision',
  name: 'revision',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlock'],
    },
  },
  default: '',
  description: 'Block number or block ID to retrieve',
  placeholder: '12345 or 0x00bc614e...',
},
{
  displayName: 'Block IDs',
  name: 'blockIds',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getMultipleBlocks'],
    },
  },
  default: '[]',
  description: 'Array of block IDs to retrieve',
  placeholder: '["0x00bc614e...", "0x00bc615e..."]',
},
{
  displayName: 'Transaction ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction ID (hash)',
},
{
  displayName: 'Transaction ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionReceipt'],
    },
  },
  default: '',
  description: 'The transaction ID (hash) to get receipt for',
},
{
  displayName: 'Raw Transaction',
  name: 'raw',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['sendTransaction'],
    },
  },
  default: '',
  description: 'The raw signed transaction data',
},
{
  displayName: 'Pending',
  name: 'pending',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['sendTransaction'],
    },
  },
  default: false,
  description: 'Whether to return pending transaction status',
},
{
  displayName: 'Transactions',
  name: 'transactions',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['sendBatchTransactions'],
    },
  },
  default: '',
  description: 'Array of raw signed transactions to submit',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount', 'getAccountCode', 'getAccountStorage'],
    },
  },
  default: '',
  description: 'The account address to query',
  placeholder: '0x...',
},
{
  displayName: 'Storage Key',
  name: 'storageKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountStorage'],
    },
  },
  default: '',
  description: 'The storage key to retrieve',
  placeholder: '0x...',
},
{
  displayName: 'Addresses',
  name: 'addresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBatchAccounts'],
    },
  },
  default: '',
  description: 'Comma-separated list of addresses to query',
  placeholder: '0x...,0x...',
},
{
  displayName: 'Revision',
  name: 'revision',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount', 'getAccountCode', 'getAccountStorage', 'getBatchAccounts'],
    },
  },
  default: 'best',
  description: 'Block revision to query (block number, ID, or "best"/"finalized")',
  placeholder: 'best',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance', 'getBatchTokenBalances'],
    },
  },
  default: '',
  description: 'The account address to check token balance for',
},
{
  displayName: 'Token Address',
  name: 'tokenAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance', 'getTokenTransfers', 'getTokenHolders'],
    },
  },
  default: '',
  description: 'The token contract address',
},
{
  displayName: 'Token Addresses',
  name: 'tokenAddresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getBatchTokenBalances'],
    },
  },
  default: '',
  description: 'Comma-separated list of token contract addresses',
},
{
  displayName: 'Revision',
  name: 'revision',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance', 'getBatchTokenBalances'],
    },
  },
  default: '',
  description: 'Block revision to query (optional)',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenTransfers', 'getTokenHolders'],
    },
  },
  default: 0,
  description: 'Number of items to skip',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenTransfers', 'getTokenHolders'],
    },
  },
  default: 50,
  description: 'Maximum number of items to return',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract', 'getContractEvents'],
    },
  },
  default: '',
  description: 'The smart contract address to interact with',
},
{
  displayName: 'Contract Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract'],
    },
  },
  default: '',
  description: 'The encoded function call data (ABI encoded)',
},
{
  displayName: 'Caller Address',
  name: 'caller',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract', 'batchCallContracts'],
    },
  },
  default: '',
  description: 'The address calling the contract (optional)',
},
{
  displayName: 'Gas Limit',
  name: 'gas',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract', 'batchCallContracts'],
    },
  },
  default: 21000,
  description: 'Gas limit for the transaction',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract', 'batchCallContracts'],
    },
  },
  default: '1000000000000000',
  description: 'Gas price in Wei',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['callContract'],
    },
  },
  default: '0',
  description: 'Amount of VET to send with the transaction (in Wei)',
},
{
  displayName: 'Clauses',
  name: 'clauses',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['batchCallContracts', 'traceContractCall'],
    },
  },
  default: '[]',
  description: 'Array of contract call clauses for batch execution',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['getContractEvents'],
    },
  },
  default: 0,
  description: 'Number of events to skip',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['getContractEvents'],
    },
  },
  default: 100,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['getContractEvents'],
    },
  },
  default: '[]',
  description: 'Array of event topics to filter by',
},
{
  displayName: 'Target',
  name: 'target',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['traceContractCall'],
    },
  },
  default: '',
  description: 'Target block ID or best for tracing',
},
{
  displayName: 'Tracer',
  name: 'tracer',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['traceContractCall'],
    },
  },
  default: 'call',
  description: 'Type of tracer to use (call, opcode, etc.)',
},
{
  displayName: 'Range',
  name: 'range',
  type: 'fixedCollection',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventLogs', 'getTransferLogs'],
    },
  },
  default: {},
  description: 'Block range for filtering logs',
  options: [
    {
      name: 'rangeValues',
      displayName: 'Range',
      values: [
        {
          displayName: 'From Block',
          name: 'from',
          type: 'number',
          default: 0,
          description: 'Starting block number',
        },
        {
          displayName: 'To Block',
          name: 'to',
          type: 'number',
          default: 0,
          description: 'Ending block number',
        },
      ],
    },
  ],
},
{
  displayName: 'Options',
  name: 'options',
  type: 'collection',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventLogs', 'getTransferLogs'],
    },
  },
  default: {},
  description: 'Additional filtering options',
  options: [
    {
      displayName: 'Offset',
      name: 'offset',
      type: 'number',
      default: 0,
      description: 'Number of records to skip',
    },
    {
      displayName: 'Limit',
      name: 'limit',
      type: 'number',
      default: 100,
      description: 'Maximum number of records to return',
    },
  ],
},
{
  displayName: 'Criteria Set',
  name: 'criteriaSet',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventLogs', 'getTransferLogs'],
    },
  },
  default: {},
  description: 'Filter criteria for logs',
  options: [
    {
      name: 'criteria',
      displayName: 'Criteria',
      values: [
        {
          displayName: 'Address',
          name: 'address',
          type: 'string',
          default: '',
          description: 'Contract address to filter by',
        },
        {
          displayName: 'Topics',
          name: 'topics',
          type: 'string',
          typeOptions: {
            multipleValues: true,
          },
          default: [],
          description: 'Event topics to filter by',
        },
      ],
    },
  ],
},
{
  displayName: 'Position',
  name: 'pos',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['subscribeToBlocks', 'subscribeToEvents'],
    },
  },
  default: 'best',
  description: 'Block position to start subscription from (best, finalized, or block ID)',
},
{
  displayName: 'Address',
  name: 'addr',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['subscribeToEvents'],
    },
  },
  default: '',
  description: 'Contract address to subscribe to events from',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'string',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['subscribeToEvents'],
    },
  },
  default: [],
  description: 'Event topics to subscribe to',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'log':
        return [await executeLogOperations.call(this, items)];
      case 'node':
        return [await executeNodeOperations.call(this, items)];
      case 'contract':
        return [await executeContractOperations.call(this, items)];
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'tokens':
        return [await executeTokensOperations.call(this, items)];
      case 'contracts':
        return [await executeContractsOperations.call(this, items)];
      case 'events':
        return [await executeEventsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('vechainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const address = this.getNodeParameter('address', i) as string;

      switch (operation) {
        case 'getAccount': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}`,
            headers: {
              'X-Thor-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        case 'getAccountCode': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/code`,
            headers: {
              'X-Thor-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        case 'getAccountStorage': {
          const storageKey = this.getNodeParameter('storageKey', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/storage/${storageKey}`,
            headers: {
              'X-Thor-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i }
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i }
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeBlockOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('vechainApi') as any;
  
  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBestBlock': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/best`,
            headers: {
              'X-Thor-API-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getBlock': {
          const revision = this.getNodeParameter('revision', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/${revision}`,
            headers: {
              'X-Thor-API-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getBlockReceipts': {
          const revision = this.getNodeParameter('revision', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/${revision}/receipts`,
            headers: {
              'X-Thor-API-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}

async function executeTransactionOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('vechainApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			// Build base headers
			const headers: any = {
				'Content-Type': 'application/json',
			};

			// Add API key if provided
			if (credentials.apiKey) {
				headers['x-api-key'] = credentials.apiKey;
			}

			// Add additional headers if specified
			const additionalHeaders = this.getNodeParameter('additionalHeaders', i, {}) as any;
			if (additionalHeaders.headers) {
				for (const header of additionalHeaders.headers) {
					headers[header.name] = header.value;
				}
			}

			switch (operation) {
				case 'getTransaction': {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/transactions/${transactionId}`,
						headers: headers,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionReceipt': {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/transactions/${transactionId}/receipt`,
						headers: headers,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'sendTransaction': {
					const rawTransactionData = this.getNodeParameter('rawTransactionData', i) as string;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/transactions`,
						headers: headers,
						body: {
							raw: rawTransactionData,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
						{ itemIndex: i },
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeLogOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('vechainApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'filterEventLogs': {
					const address = this.getNodeParameter('address', i) as string;
					const topics = this.getNodeParameter('topics', i) as string;
					const range = this.getNodeParameter('range', i) as any;

					const requestBody: any = {
						address: address,
					};

					if (topics) {
						try {
							requestBody.topics = JSON.parse(topics);
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON in topics parameter');
						}
					}

					if (range && range.blockRange) {
						requestBody.range = {
							unit: 'block',
							from: range.blockRange.fromBlock || 0,
							to: range.blockRange.toBlock || 0,
						};
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/logs/event`,
						headers: {
							'x-thor-key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'filterTransferLogs': {
					const address = this.getNodeParameter('address', i) as string;
					const sender = this.getNodeParameter('sender', i) as string;
					const recipient = this.getNodeParameter('recipient', i) as string;
					const range = this.getNodeParameter('range', i) as any;

					const requestBody: any = {
						address: address,
					};

					if (sender) {
						requestBody.sender = sender;
					}

					if (recipient) {
						requestBody.recipient = recipient;
					}

					if (range && range.blockRange) {
						requestBody.range = {
							unit: 'block',
							from: range.blockRange.fromBlock || 0,
							to: range.blockRange.toBlock || 0,
						};
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/logs/transfer`,
						headers: {
							'x-thor-key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeNodeOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('vechainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getNetworkPeers': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/node/network/peers`,
            headers: {
              'X-Thor-Api-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPeerStats': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/node/network/peers/stats`,
            headers: {
              'X-Thor-Api-Key': credentials.apiKey,
              'Content-Type': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i }
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i }
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeContractOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('vechainApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'callContract': {
					const address = this.getNodeParameter('address', i) as string;
					const calldata = this.getNodeParameter('calldata', i) as string;
					const caller = this.getNodeParameter('caller', i) as string;

					const body: any = {
						data: calldata,
					};

					if (caller) {
						body.caller = caller;
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/accounts/${address}`,
						headers: {
							'Content-Type': 'application/json',
							'x-thor-api-key': credentials.apiKey,
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'batchCallContract': {
					const clauses = this.getNodeParameter('clauses', i) as any[];

					const formattedClauses = clauses.map((clause: any) => ({
						to: clause.to || null,
						value: clause.value || '0x0',
						data: clause.data || '0x',
					}));

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/accounts/batch`,
						headers: {
							'Content-Type': 'application/json',
							'x-thor-api-key': credentials.apiKey,
						},
						body: {
							clauses: formattedClauses,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeBlocksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('vechainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBestBlock': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/best`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlock': {
          const revision = this.getNodeParameter('revision', i) as string;
          if (!revision) {
            throw new NodeOperationError(this.getNode(), 'Revision parameter is required');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/${revision}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMultipleBlocks': {
          const blockIds = this.getNodeParameter('blockIds', i) as string;
          let parsedBlockIds: any;
          
          try {
            parsedBlockIds = typeof blockIds === 'string' ? JSON.parse(blockIds) : blockIds;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Block IDs must be a valid JSON array');
          }

          if (!Array.isArray(parsedBlockIds) || parsedBlockIds.length === 0) {
            throw new NodeOperationError(this.getNode(), 'Block IDs must be a non-empty array');
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/blocks`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body: parsedBlockIds,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result,
        pairedItem: { item: i }
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message },
          pairedItem: { item: i }
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('vechainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getTransaction': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${id}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'sendTransaction': {
          const raw = this.getNodeParameter('raw', i) as string;
          const pending = this.getNodeParameter('pending', i, false) as boolean;
          
          const body: any = {
            raw,
          };
          
          let url = `${credentials.baseUrl}/transactions`;
          if (pending) {
            url += '?pending=true';
          }
          
          const options: any = {
            method: 'POST',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionReceipt': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${id}/receipt`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'sendBatchTransactions': {
          const transactions = this.getNodeParameter('transactions', i) as string;
          
          let parsedTransactions: any;
          try {
            parsedTransactions = JSON.parse(transactions);
          } catch (parseError: any) {
            throw new NodeOperationError(
              this.getNode(),
              `Invalid JSON format for transactions: ${parseError.message}`,
            );
          }
          
          if (!Array.isArray(parsedTransactions)) {
            throw new NodeOperationError(
              this.getNode(),
              'Transactions must be an array of transaction objects',
            );
          }
          
          const body: any = {
            transactions: parsedTransactions,
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/batch`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }
      
      returnData.push({ json: result