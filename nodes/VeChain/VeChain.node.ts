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
        default: 'blocks',
      },
      // Operation dropdowns per resource
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
      
      returnData.push({ json: result, pairedItem: { item: i } });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeAccountsOperations(
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
        case 'getAccount': {
          const address = this.getNodeParameter('address', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearer_token}`,
              'Content-Type': 'application/json',
            },
            qs: revision && revision !== 'best' ? { revision } : {},
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountCode': {
          const address = this.getNodeParameter('address', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/code`,
            headers: {
              'Authorization': `Bearer ${credentials.bearer_token}`,
              'Content-Type': 'application/json',
            },
            qs: revision && revision !== 'best' ? { revision } : {},
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountStorage': {
          const address = this.getNodeParameter('address', i) as string;
          const storageKey = this.getNodeParameter('storageKey', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/storage/${storageKey}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearer_token}`,
              'Content-Type': 'application/json',
            },
            qs: revision && revision !== 'best' ? { revision } : {},
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBatchAccounts': {
          const addressesString = this.getNodeParameter('addresses', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;
          
          const addresses = addressesString.split(',').map((addr: string) => addr.trim());
          
          const requestBody: any = {
            addresses: addresses,
          };

          if (revision && revision !== 'best') {
            requestBody.revision = revision;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/accounts/batch`,
            headers: {
              'Authorization': `Bearer ${credentials.bearer_token}`,
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
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeTokensOperations(
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
        case 'getTokenBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;

          let url = `${credentials.baseUrl}/accounts/${address}/tokens/${tokenAddress}`;
          if (revision) {
            url += `?revision=${revision}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBatchTokenBalances': {
          const address = this.getNodeParameter('address', i) as string;
          const tokenAddressesStr = this.getNodeParameter('tokenAddresses', i) as string;
          const revision = this.getNodeParameter('revision', i) as string;

          const tokenAddresses = tokenAddressesStr.split(',').map((addr: string) => addr.trim());

          let url = `${credentials.baseUrl}/accounts/${address}/tokens/batch`;
          if (revision) {
            url += `?revision=${revision}`;
          }

          const options: any = {
            method: 'POST',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              tokenAddresses,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenTransfers': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const offset = this.getNodeParameter('offset', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const params = new URLSearchParams();
          if (offset !== undefined) params.append('offset', offset.toString());
          if (limit !== undefined) params.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/tokens/${tokenAddress}/transfers${params.toString() ? '?' + params.toString() : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenHolders': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const offset = this.getNodeParameter('offset', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const params = new URLSearchParams();
          if (offset !== undefined) params.append('offset', offset.toString());
          if (limit !== undefined) params.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/tokens/${tokenAddress}/holders${params.toString() ? '?' + params.toString() : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
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
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }

  return returnData;
}

async function executeContractsOperations(
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
          const data = this.getNodeParameter('data', i) as string;
          const caller = this.getNodeParameter('caller', i, '') as string;
          const gas = this.getNodeParameter('gas', i, 21000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '1000000000000000') as string;
          const value = this.getNodeParameter('value', i, '0') as string;

          const body: any = {
            data,
            gas,
            gasPrice,
            value,
          };

          if (caller) {
            body.caller = caller;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/accounts/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'batchCallContracts': {
          const clauses = JSON.parse(this.getNodeParameter('clauses', i) as string);
          const caller = this.getNodeParameter('caller', i, '') as string;
          const gas = this.getNodeParameter('gas', i, 21000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '1000000000000000') as string;

          const body: any = {
            clauses,
            gas,
            gasPrice,
          };

          if (caller) {
            body.caller = caller;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/accounts/batch`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContractEvents': {
          const address = this.getNodeParameter('address', i) as string;
          const offset = this.getNodeParameter('offset', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const topics = this.getNodeParameter('topics', i, '[]') as string;

          const queryParams = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
          });

          if (topics !== '[]') {
            const topicsArray = JSON.parse(topics);
            topicsArray.forEach((topic: string, index: number) => {
              queryParams.append(`topic${index}`, topic);
            });
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/events?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'traceContractCall': {
          const target = this.getNodeParameter('target', i) as string;
          const clauses = JSON.parse(this.getNodeParameter('clauses', i) as string);
          const tracer = this.getNodeParameter('tracer', i, 'call') as string;

          const body: any = {
            target,
            clauses,
            config: {
              tracer,
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/debug/tracers`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
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
            { itemIndex: i }
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
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeEventsOperations(
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
        case 'getEventLogs': {
          const range = this.getNodeParameter('range.rangeValues', i, {}) as any;
          const options = this.getNodeParameter('options', i, {}) as any;
          const criteriaSet = this.getNodeParameter('criteriaSet.criteria', i, []) as any[];

          const body: any = {
            range: {
              unit: 'block',
              from: range.from || 0,
              to: range.to || 0,
            },
            options: {
              offset: options.offset || 0,
              limit: options.limit || 100,
            },
            criteriaSet: criteriaSet.map((criteria: any) => ({
              address: criteria.address,
              topic0: criteria.topics?.[0],
              topic1: criteria.topics?.[1],
              topic2: criteria.topics?.[2],
              topic3: criteria.topics?.[3],
              topic4: criteria.topics?.[4],
            })),
          };

          const requestOptions: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/logs/event`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'getTransferLogs': {
          const range = this.getNodeParameter('range.rangeValues', i, {}) as any;
          const options = this.getNodeParameter('options', i, {}) as any;
          const criteriaSet = this.getNodeParameter('criteriaSet.criteria', i, []) as any[];

          const body: any = {
            range: {
              unit: 'block',
              from: range.from || 0,
              to: range.to || 0,
            },
            options: {
              offset: options.offset || 0,
              limit: options.limit || 100,
            },
            criteriaSet: criteriaSet.map((criteria: any) => ({
              txOrigin: criteria.address,
              sender: criteria.address,
              recipient: criteria.address,
            })),
          };

          const requestOptions: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/logs/transfer`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'subscribeToBlocks': {
          const pos = this.getNodeParameter('pos', i, 'best') as string;

          const requestOptions: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/subscriptions/block`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
            },
            qs: {
              pos,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(requestOptions) as any;
          break;
        }

        case 'subscribeToEvents': {
          const pos = this.getNodeParameter('pos', i, 'best') as string;
          const addr = this.getNodeParameter('addr', i, '') as string;
          const topics = this.getNodeParameter('topics', i, []) as string[];

          const qs: any = { pos };
          if (addr) qs.addr = addr;
          if (topics.length > 0) {
            topics.forEach((topic: string, index: number) => {
              qs[`t${index}`] = topic;
            });
          }

          const requestOptions: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/subscriptions/event`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(requestOptions) as any;
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
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
