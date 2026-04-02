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
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://vethor-node.vechain.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAccount operation', () => {
    it('should get account details successfully', async () => {
      const mockResponse = {
        balance: '0x1bc16d674ec80000',
        energy: '0x1bc16d674ec80000',
        hasCode: false
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('0x0000000000000000000000000000000000000000');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getAccount errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('invalid-address');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Invalid address' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getAccountCode operation', () => {
    it('should get account code successfully', async () => {
      const mockResponse = {
        code: '0x608060405234801561001057600080fd5b50'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountCode')
        .mockReturnValueOnce('0x0000000000000000000000000000000000000000');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getAccountCode errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountCode')
        .mockReturnValueOnce('invalid-address');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Account not found' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getAccountStorage operation', () => {
    it('should get account storage successfully', async () => {
      const mockResponse = {
        value: '0x0000000000000000000000000000000000000000000000000000000000000001'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountStorage')
        .mockReturnValueOnce('0x0000000000000000000000000000000000000000')
        .mockReturnValueOnce('0x0000000000000000000000000000000000000000000000000000000000000000');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getAccountStorage errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountStorage')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('invalid-key');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid storage key'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Invalid storage key' },
        pairedItem: { item: 0 }
      }]);
    });
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://vethor-node.vechain.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn() },
    };
  });

  describe('getBestBlock operation', () => {
    it('should get the latest block successfully', async () => {
      const mockResponse = { 
        number: 12345, 
        id: '0x123', 
        timestamp: 1640995200,
        gasLimit: 20000000
      };
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getBestBlock');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://vethor-node.vechain.org/blocks/best',
        headers: {
          'X-Thor-API-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
    });

    it('should handle getBestBlock error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getBestBlock');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Network error');
    });
  });

  describe('getBlock operation', () => {
    it('should get specific block successfully', async () => {
      const mockResponse = { 
        number: 12345, 
        id: '0x123', 
        timestamp: 1640995200,
        transactions: []
      };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlock')
        .mockReturnValueOnce('12345');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://vethor-node.vechain.org/blocks/12345',
        headers: {
          'X-Thor-API-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
    });

    it('should handle getBlock error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlock')
        .mockReturnValueOnce('12345');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

      await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Block not found');
    });
  });

  describe('getBlockReceipts operation', () => {
    it('should get block receipts successfully', async () => {
      const mockResponse = [
        { txID: '0x123', gasUsed: 21000 },
        { txID: '0x456', gasUsed: 50000 }
      ];
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockReceipts')
        .mockReturnValueOnce('12345');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://vethor-node.vechain.org/blocks/12345/receipts',
        headers: {
          'X-Thor-API-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
    });

    it('should handle getBlockReceipts error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockReceipts')
        .mockReturnValueOnce('12345');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Receipts not found'));

      await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Receipts not found');
    });
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://vethor-node.vechain.org',
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

	describe('getTransaction operation', () => {
		it('should get transaction details successfully', async () => {
			const mockResponse = {
				id: '0x123abc',
				chainTag: 1,
				blockRef: '0x00000000aabbccdd',
				expiration: 32,
				clauses: [],
				gasPriceCoef: 0,
				gas: 21000,
				origin: '0x456def',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('0x123abc')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://vethor-node.vechain.org/transactions/0x123abc',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'test-api-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getTransaction errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('invalid-id')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: { error: 'Transaction not found' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getTransactionReceipt operation', () => {
		it('should get transaction receipt successfully', async () => {
			const mockResponse = {
				gasUsed: 21000,
				gasPayer: '0x456def',
				paid: '0x1bc16d674ec80000',
				reward: '0x576e189f04f60000',
				reverted: false,
				outputs: [],
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionReceipt')
				.mockReturnValueOnce('0x123abc')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://vethor-node.vechain.org/transactions/0x123abc/receipt',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'test-api-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('sendTransaction operation', () => {
		it('should send transaction successfully', async () => {
			const mockResponse = {
				id: '0x789ghi',
			};

			const rawTxData = '0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a04f4c17305743700648bc4f6cd3038ec6f6af0df73e31757d8b9f8dc5c4c0c50ea05147f74a9b737c2b6b5a8c9b8d7d4a4f4d4e4f4g4h4i4j4k4l4m4n4o4p4q4r4s4t';

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sendTransaction')
				.mockReturnValueOnce(rawTxData)
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://vethor-node.vechain.org/transactions',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'test-api-key',
				},
				body: {
					raw: rawTxData,
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle sendTransaction errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sendTransaction')
				.mockReturnValueOnce('invalid-raw-data')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid transaction data'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(false);

			const items = [{ json: {} }];

			await expect(
				executeTransactionOperations.call(mockExecuteFunctions, items),
			).rejects.toThrow('Invalid transaction data');
		});
	});
});

describe('Log Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://vethor-node.vechain.org',
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

	describe('filterEventLogs operation', () => {
		it('should filter event logs successfully', async () => {
			const mockResponse = [
				{
					address: '0x0000000000000000000000000000456E65726779',
					topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
					data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('filterEventLogs')
				.mockReturnValueOnce('0x0000000000000000000000000000456E65726779')
				.mockReturnValueOnce('[]')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeLogOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://vethor-node.vechain.org/logs/event',
				headers: {
					'x-thor-key': 'test-key',
					'Content-Type': 'application/json',
				},
				body: {
					address: '0x0000000000000000000000000000456E65726779',
					topics: [],
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle errors in filterEventLogs operation', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('filterEventLogs')
				.mockReturnValueOnce('0x0000000000000000000000000000456E65726779')
				.mockReturnValueOnce('[]')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeLogOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: { error: 'API Error' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('filterTransferLogs operation', () => {
		it('should filter transfer logs successfully', async () => {
			const mockResponse = [
				{
					sender: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
					recipient: '0x435933c8064b4ae76be665428e0307ef2ccfbd68',
					amount: '0x2386f26fc10000',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('filterTransferLogs')
				.mockReturnValueOnce('0x0000000000000000000000000000456E65726779')
				.mockReturnValueOnce('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed')
				.mockReturnValueOnce('0x435933c8064b4ae76be665428e0307ef2ccfbd68')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeLogOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://vethor-node.vechain.org/logs/transfer',
				headers: {
					'x-thor-key': 'test-key',
					'Content-Type': 'application/json',
				},
				body: {
					address: '0x0000000000000000000000000000456E65726779',
					sender: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
					recipient: '0x435933c8064b4ae76be665428e0307ef2ccfbd68',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle errors in filterTransferLogs operation', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('filterTransferLogs')
				.mockReturnValueOnce('0x0000000000000000000000000000456E65726779')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(false);

			await expect(
				executeLogOperations.call(mockExecuteFunctions, [{ json: {} }]),
			).rejects.toThrow('Network Error');
		});
	});
});

describe('Node Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://vethor-node.vechain.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getNetworkPeers', () => {
    it('should get network peers successfully', async () => {
      const mockPeers = [
        { id: 'peer1', address: '192.168.1.1:8080', bestBlockID: '0x123' },
        { id: 'peer2', address: '192.168.1.2:8080', bestBlockID: '0x456' }
      ];
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getNetworkPeers');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPeers);

      const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://vethor-node.vechain.org/node/network/peers',
        headers: {
          'X-Thor-Api-Key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockPeers, pairedItem: { item: 0 } }]);
    });

    it('should handle getNetworkPeers error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getNetworkPeers');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Network error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPeerStats', () => {
    it('should get peer stats successfully', async () => {
      const mockStats = {
        totalPeers: 25,
        activePeers: 23,
        inboundPeers: 12,
        outboundPeers: 11
      };
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getPeerStats');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStats);

      const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://vethor-node.vechain.org/node/network/peers/stats',
        headers: {
          'X-Thor-Api-Key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockStats, pairedItem: { item: 0 } }]);
    });

    it('should handle getPeerStats error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getPeerStats');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Stats unavailable'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Stats unavailable' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Contract Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://vethor-node.vechain.org',
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

	describe('callContract operation', () => {
		it('should call contract function successfully', async () => {
			const mockResponse = {
				data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
				events: [],
				transfers: [],
				gasUsed: 1234,
				reverted: false,
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('callContract')
				.mockReturnValueOnce('0x0000000000000000000000000000456e65726779')
				.mockReturnValueOnce('0x70a08231000000000000000000000000abc123')
				.mockReturnValueOnce('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://vethor-node.vechain.org/accounts/0x0000000000000000000000000000456e65726779',
				headers: {
					'Content-Type': 'application/json',
					'x-thor-api-key': 'test-api-key',
				},
				body: {
					data: '0x70a08231000000000000000000000000abc123',
					caller: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
				},
				json: true,
			});

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle call contract errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('callContract')
				.mockReturnValueOnce('0xinvalid')
				.mockReturnValueOnce('0x123')
				.mockReturnValueOnce('');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid contract address'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'Invalid contract address' },
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('batchCallContract operation', () => {
		it('should execute batch contract calls successfully', async () => {
			const mockResponse = [
				{
					data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
					events: [],
					transfers: [],
					gasUsed: 1234,
					reverted: false,
				},
				{
					data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640001',
					events: [],
					transfers: [],
					gasUsed: 5678,
					reverted: false,
				},
			];

			const clauses = [
				{
					to: '0x0000000000000000000000000000456e65726779',
					value: '0x0',
					data: '0x70a08231000000000000000000000000abc123',
				},
				{
					to: '0x0000000000000000000000000000456e65726779',
					value: '0x0',
					data: '0x70a08231000000000000000000000000def456',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('batchCallContract')
				.mockReturnValueOnce(clauses);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://vethor-node.vechain.org/accounts/batch',
				headers: {
					'Content-Type': 'application/json',
					'x-thor-api-key': 'test-api-key',
				},
				body: {
					clauses: [
						{
							to: '0x0000000000000000000000000000456e65726779',
							value: '0x0',
							data: '0x70a08231000000000000000000000000abc123',
						},
						{
							to: '0x0000000000000000000000000000456e65726779',
							value: '0x0',
							data: '0x70a08231000000000000000000000000def456',
						},
					],
				},
				json: true,
			});

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle batch call contract errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('batchCallContract')
				.mockReturnValueOnce([]);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Empty clauses array'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'Empty clauses array' },
				pairedItem: { item: 0 },
			}]);
		});
	});
});
});
