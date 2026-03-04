/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { VeChain } from '../nodes/VeChain/VeChain.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('VeChain Node', () => {
  let node: VeChain;

  beforeAll(() => {
    node = new VeChain();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('VeChain');
      expect(node.description.name).toBe('vechain');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
        baseUrl: 'https://mainnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getBestBlock', () => {
    it('should get the best block successfully', async () => {
      const mockBlock = {
        number: 12345,
        id: '0x00bc614e',
        size: 1024,
        parentID: '0x00bc613e',
        timestamp: 1640995200,
        gasLimit: 30000000,
        beneficiary: '0x0000000000000000000000000000000000000000',
        gasUsed: 21000,
        totalScore: 12345,
        txsRoot: '0x',
        stateRoot: '0x',
        receiptsRoot: '0x',
        signer: '0x',
        isTrunk: true,
        transactions: []
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBestBlock';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlock);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet.veblocks.net/blocks/best',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockBlock,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getBestBlock error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBestBlock';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getBlock', () => {
    it('should get a specific block successfully', async () => {
      const mockBlock = {
        number: 12345,
        id: '0x00bc614e',
        size: 1024,
        parentID: '0x00bc613e',
        timestamp: 1640995200
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
        if (paramName === 'operation') return 'getBlock';
        if (paramName === 'revision') return '12345';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlock);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet.veblocks.net/blocks/12345',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockBlock,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle missing revision parameter', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBlock';
        if (paramName === 'revision') return '';
        return undefined;
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Revision parameter is required' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getMultipleBlocks', () => {
    it('should get multiple blocks successfully', async () => {
      const mockBlocks = [
        { number: 12345, id: '0x00bc614e' },
        { number: 12346, id: '0x00bc615e' }
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMultipleBlocks';
        if (paramName === 'blockIds') return '["0x00bc614e", "0x00bc615e"]';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlocks);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.veblocks.net/blocks',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        body: ['0x00bc614e', '0x00bc615e'],
        json: true,
      });

      expect(result).toEqual([{
        json: mockBlocks,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle invalid JSON in blockIds', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMultipleBlocks';
        if (paramName === 'blockIds') return 'invalid json';
        return undefined;
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Block IDs must be a valid JSON array' },
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle empty blockIds array', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMultipleBlocks';
        if (paramName === 'blockIds') return '[]';
        return undefined;
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Block IDs must be a non-empty array' },
        pairedItem: { item: 0 }
      }]);
    });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        token: 'test-api-key',
        baseUrl: 'https://mainnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getTransaction', () => {
    it('should get transaction by ID successfully', async () => {
      const mockTransaction = {
        id: '0x1234567890abcdef',
        blockNumber: 123456,
        gas: 21000,
        gasPrice: '1000000000000000',
        status: 'confirmed'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransaction';
        if (param === 'id') return '0x1234567890abcdef';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransaction);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet.veblocks.net/transactions/0x1234567890abcdef',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle error when getting transaction', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransaction';
        if (param === 'id') return 'invalid-id';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction not found'));

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction successfully', async () => {
      const mockResponse = {
        id: '0x1234567890abcdef',
        status: 'pending'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendTransaction';
        if (param === 'raw') return '0xf86c808504a817c800825208944592d8f8d7b001e72cb26a73e4fa1806a51ac79d880de0b6b3a7640000801ba05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1a05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1';
        if (param === 'pending') return false;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTransactionReceipt', () => {
    it('should get transaction receipt successfully', async () => {
      const mockReceipt = {
        transactionHash: '0x1234567890abcdef',
        blockNumber: 123456,
        gasUsed: 21000,
        status: '0x1',
        logs: []
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionReceipt';
        if (param === 'id') return '0x1234567890abcdef';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockReceipt);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockReceipt);
    });
  });

  describe('sendBatchTransactions', () => {
    it('should send batch transactions successfully', async () => {
      const mockResponse = {
        transactions: [
          { id: '0x1234567890abcdef', status: 'pending' },
          { id: '0xabcdef1234567890', status: 'pending' }
        ]
      };

      const batchTransactions = [
        { raw: '0xf86c808504a817c800825208944592d8f8d7b001e72cb26a73e4fa1806a51ac79d880de0b6b3a7640000801ba05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1a05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1' },
        { raw: '0xf86c808504a817c800825208944592d8f8d7b001e72cb26a73e4fa1806a51ac79d880de0b6b3a7640000801ba05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1a05e2d9d78e4b8e8e1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1' }
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendBatchTransactions';
        if (param === 'transactions') return JSON.stringify(batchTransactions);
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle invalid JSON in batch transactions', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendBatchTransactions';
        if (param === 'transactions') return 'invalid json';
        return undefined;
      });

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Invalid JSON format for transactions');
    });
  });
});

describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearer_token: 'test-bearer-token',
        baseUrl: 'https://testnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAccount operation', () => {
    it('should get account information successfully', async () => {
      const mockAccountData = {
        balance: '1000000000000000000000',
        energy: '500000000000000000000',
        hasCode: false,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getAccount';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'revision': return 'best';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountData);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockAccountData,
        pairedItem: { item: 0 },
      }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://testnet.veblocks.net/accounts/0x1234567890123456789012345678901234567890',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        qs: {},
        json: true,
      });
    });

    it('should handle errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getAccount';
          case 'address': return 'invalid-address';
          case 'revision': return 'best';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));

      const items = [{ json: {} }];
      
      await expect(executeAccountsOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });
  });

  describe('getAccountCode operation', () => {
    it('should get account code successfully', async () => {
      const mockCodeData = {
        code: '0x608060405234801561001057600080fd5b50...',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getAccountCode';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'revision': return 'best';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockCodeData);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockCodeData,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getAccountStorage operation', () => {
    it('should get account storage successfully', async () => {
      const mockStorageData = {
        value: '0x0000000000000000000000000000000000000000000000000000000000000001',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getAccountStorage';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'storageKey': return '0x0000000000000000000000000000000000000000000000000000000000000000';
          case 'revision': return 'best';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStorageData);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockStorageData,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getBatchAccounts operation', () => {
    it('should get batch accounts successfully', async () => {
      const mockBatchData = [
        {
          address: '0x1234567890123456789012345678901234567890',
          balance: '1000000000000000000000',
          energy: '500000000000000000000',
        },
        {
          address: '0x0987654321098765432109876543210987654321',
          balance: '2000000000000000000000',
          energy: '1000000000000000000000',
        },
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getBatchAccounts';
          case 'addresses': return '0x1234567890123456789012345678901234567890,0x0987654321098765432109876543210987654321';
          case 'revision': return 'best';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBatchData);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockBatchData,
        pairedItem: { item: 0 },
      }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://testnet.veblocks.net/accounts/batch',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        body: {
          addresses: ['0x1234567890123456789012345678901234567890', '0x0987654321098765432109876543210987654321'],
        },
        json: true,
      });
    });
  });
});

describe('Tokens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
        baseUrl: 'https://mainnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get token balance successfully', async () => {
    const mockResponse = {
      balance: '1000000000000000000000',
      decimals: 18,
      symbol: 'VET',
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getTokenBalance')
      .mockImplementationOnce(() => '0x1234567890123456789012345678901234567890')
      .mockImplementationOnce(() => '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      .mockImplementationOnce(() => '');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTokensOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet.veblocks.net/accounts/0x1234567890123456789012345678901234567890/tokens/0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should get batch token balances successfully', async () => {
    const mockResponse = [
      { tokenAddress: '0xtoken1', balance: '1000000000000000000000' },
      { tokenAddress: '0xtoken2', balance: '500000000000000000000' },
    ];

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getBatchTokenBalances')
      .mockImplementationOnce(() => '0x1234567890123456789012345678901234567890')
      .mockImplementationOnce(() => '0xtoken1,0xtoken2')
      .mockImplementationOnce(() => '');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTokensOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet.veblocks.net/accounts/0x1234567890123456789012345678901234567890/tokens/batch',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        tokenAddresses: ['0xtoken1', '0xtoken2'],
      },
    });
  });

  test('should get token transfers successfully', async () => {
    const mockResponse = {
      transfers: [
        {
          from: '0xfrom',
          to: '0xto',
          value: '1000000000000000000',
          blockNumber: 12345,
        },
      ],
      total: 1,
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getTokenTransfers')
      .mockImplementationOnce(() => '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      .mockImplementationOnce(() => 0)
      .mockImplementationOnce(() => 50);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTokensOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('should get token holders successfully', async () => {
    const mockResponse = {
      holders: [
        {
          address: '0xholder1',
          balance: '1000000000000000000000',
        },
        {
          address: '0xholder2',
          balance: '500000000000000000000',
        },
      ],
      total: 2,
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getTokenHolders')
      .mockImplementationOnce(() => '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      .mockImplementationOnce(() => 0)
      .mockImplementationOnce(() => 50);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTokensOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('should handle API errors', async () => {
    const mockError = {
      message: 'API Error',
      httpCode: 400,
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getTokenBalance')
      .mockImplementationOnce(() => '0x1234567890123456789012345678901234567890')
      .mockImplementationOnce(() => '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      .mockImplementationOnce(() => '');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const items = [{ json: {} }];

    await expect(
      executeTokensOperations.call(mockExecuteFunctions, items)
    ).rejects.toThrow();
  });

  test('should handle continue on fail', async () => {
    const mockError = new Error('Test error');

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getTokenBalance')
      .mockImplementationOnce(() => '0x1234567890123456789012345678901234567890')
      .mockImplementationOnce(() => '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      .mockImplementationOnce(() => '');

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const items = [{ json: {} }];
    const result = await executeTokensOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      {
        json: { error: 'Test error' },
        pairedItem: { item: 0 },
      },
    ]);
  });
});

describe('Contracts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('callContract', () => {
    it('should execute contract method call successfully', async () => {
      const mockResponse = {
        data: '0x1234567890',
        events: [],
        transfers: [],
        gasUsed: 21000,
        reverted: false,
        vmError: '',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'callContract';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          case 'data': return '0xa9059cbb000000000000000000000000recipient000000000000000000000000000000000064';
          case 'caller': return '0xabcdef1234567890abcdef1234567890abcdef12';
          case 'gas': return 50000;
          case 'gasPrice': return '1000000000000000';
          case 'value': return '0';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeContractsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.veblocks.net/accounts/0x1234567890abcdef1234567890abcdef12345678',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          data: '0xa9059cbb000000000000000000000000recipient000000000000000000000000000000000064',
          caller: '0xabcdef1234567890abcdef1234567890abcdef12',
          gas: 50000,
          gasPrice: '1000000000000000',
          value: '0',
        },
        json: true,
      });
    });

    it('should handle contract call errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'callContract';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          case 'data': return '0xinvaliddata';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Contract execution failed'));

      const items = [{ json: {} }];
      
      await expect(executeContractsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('Contract execution failed');
    });
  });

  describe('batchCallContracts', () => {
    it('should execute batch contract calls successfully', async () => {
      const mockResponse = [
        { data: '0x1234', gasUsed: 21000, reverted: false },
        { data: '0x5678', gasUsed: 25000, reverted: false },
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'batchCallContracts';
          case 'clauses': return JSON.stringify([
            { to: '0x1234567890abcdef1234567890abcdef12345678', data: '0x1234' },
            { to: '0xabcdef1234567890abcdef1234567890abcdef12', data: '0x5678' },
          ]);
          case 'gas': return 100000;
          case 'gasPrice': return '1000000000000000';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeContractsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getContractEvents', () => {
    it('should get contract events successfully', async () => {
      const mockResponse = {
        events: [
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            meta: {
              blockID: '0xabcd',
              blockNumber: 12345,
              blockTimestamp: 1640995200,
              txID: '0xefgh',
              txOrigin: '0x9876543210fedcba9876543210fedcba98765432',
            },
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getContractEvents';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          case 'offset': return 0;
          case 'limit': return 100;
          case 'topics': return '[]';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeContractsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('traceContractCall', () => {
    it('should trace contract call successfully', async () => {
      const mockResponse = {
        traces: [
          {
            type: 'call',
            from: '0x1234567890abcdef1234567890abcdef12345678',
            to: '0xabcdef1234567890abcdef1234567890abcdef12',
            value: '0x0',
            gas: '0xc350',
            gasUsed: '0x5208',
            input: '0x',
            output: '0x',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'traceContractCall';
          case 'target': return 'best';
          case 'clauses': return JSON.stringify([
            { to: '0x1234567890abcdef1234567890abcdef12345678', data: '0x1234' },
          ]);
          case 'tracer': return 'call';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeContractsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Events Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
        baseUrl: 'https://mainnet.veblocks.net',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get event logs successfully', async () => {
    const mockResponse = {
      logs: [
        {
          address: '0x0000000000000000000000000000456e65726779',
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
          data: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getEventLogs';
        case 'range.rangeValues':
          return { from: 100, to: 200 };
        case 'options':
          return { offset: 0, limit: 50 };
        case 'criteriaSet.criteria':
          return [{ address: '0x0000000000000000000000000000456e65726779', topics: [] }];
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet.veblocks.net/logs/event',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      body: expect.objectContaining({
        range: { unit: 'block', from: 100, to: 200 },
        options: { offset: 0, limit: 50 },
      }),
      json: true,
    });
  });

  test('should get transfer logs successfully', async () => {
    const mockResponse = {
      transfers: [
        {
          sender: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
          recipient: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
          amount: '0x1bc16d674ec80000',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getTransferLogs';
        case 'range.rangeValues':
          return { from: 100, to: 200 };
        case 'options':
          return { offset: 0, limit: 100 };
        case 'criteriaSet.criteria':
          return [];
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should subscribe to blocks successfully', async () => {
    const mockResponse = {
      subscriptionId: 'block-sub-123',
      status: 'active',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'subscribeToBlocks';
        case 'pos':
          return 'best';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet.veblocks.net/subscriptions/block',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
      },
      qs: {
        pos: 'best',
      },
      json: true,
    });
  });

  test('should subscribe to events successfully', async () => {
    const mockResponse = {
      subscriptionId: 'event-sub-456',
      status: 'active',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'subscribeToEvents';
        case 'pos':
          return 'best';
        case 'addr':
          return '0x0000000000000000000000000000456e65726779';
        case 'topics':
          return ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'];
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getEventLogs';
        case 'range.rangeValues':
          return { from: 100, to: 200 };
        case 'options':
          return {};
        case 'criteriaSet.criteria':
          return [];
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  test('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'unknownOperation';
      return undefined;
    });

    await expect(
      executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});
});
