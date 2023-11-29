export interface Env {
	MAINNET_RPC_URL: string;
	PULSECHAIN_RPC_URL: string;
	POLYGON_RPC_URL: string;
	OPTIMISM_RPC_URL: string;
	BSC_RPC_URL: string;
	ZKSYNC_RPC_URL: string;
	ARBITRUM_RPC_URL: string;
	AVALANCHE_RPC_URL: string;
	BASE_RPC_URL: string;
	FANTOM_RPC_URL: string;

	CONTRACTS: R2Bucket;
	LIST: R2Bucket;
}

import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from 'viem/chains';
import { createPublicClient, getAddress, http, fromHex } from 'viem';
import { CHAINS } from './lib/chains';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const { publicKeys } = (await request.json()) as {
			publicKeys: string[];
		};

		const r2ObjectERC20 = await env.CONTRACTS.get('erc20.json');
		const ERC20 = (await r2ObjectERC20?.json()) as string;

		const balances = await Promise.all(
			Object.keys(CHAINS).flatMap(async (chainId) => {
				return await this.getBalances(publicKeys, chainId, ERC20, env);
			})
		).then((results) => results.filter((result) => result !== null).flat());

		return new Response(JSON.stringify(balances), { status: 200 });
	},

	async getBalances(publicKeys: string[], chainId: string, ERC20: string, env: Env) {
		const RPCS = {
			[mainnet.id]: env.MAINNET_RPC_URL,
			[optimism.id]: env.OPTIMISM_RPC_URL,
			[bsc.id]: env.BSC_RPC_URL,
			[polygon.id]: env.POLYGON_RPC_URL,
			[pulsechain.id]: env.PULSECHAIN_RPC_URL,
			[base.id]: env.BASE_RPC_URL,
			[arbitrum.id]: env.ARBITRUM_RPC_URL,
			[avalanche.id]: env.AVALANCHE_RPC_URL,
		};

		const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
		const providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];

		const r2ObjectBalance = await env.LIST.get(`${chainId}_balance.json`);
		const tokenAddresses = (await r2ObjectBalance?.json()) as any;

		const client = createPublicClient({
			chain: chain,
			transport: http(providerUrl),
		});

		const bodyRequest = publicKeys.map((publicKey: string, index: number) => {
			return {
				method: 'eth_getBalance',
				params: [publicKey, 'latest'],
				id: index,
				jsonrpc: '2.0',
			};
		});

		const request = new Request(providerUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(bodyRequest),
		});

		const result = await fetch(request);
		const getBalanceResults = (await result.json()) as any[];

		const nativeBalances = getBalanceResults.flatMap((getBalanceResult: any) => {
			const balance = fromHex(getBalanceResult.result, 'bigint') as bigint;
			if (balance !== BigInt(0)) {
				return {
					chainId: chainId,
					address: null,
					...chain.nativeCurrency,
					logoURI: `https://chain.partylabs.org/${chainId}.webp`,
					publicKey: publicKeys[0],
					balance: balance,
				};
			} else {
				return null;
			}
		});

		let erc20Contracts = publicKeys.flatMap((publicKey: string) => {
			return tokenAddresses.tokens.map((token: any) => {
				return {
					address: getAddress(token.address),
					abi: ERC20,
					functionName: 'balanceOf',
					args: [getAddress(publicKey)],
				};
			});
		});

		const results = await client.multicall({
			contracts: erc20Contracts,
		});

		const erc20Balances = erc20Contracts.flatMap((contract: any, index: number) => {
			const result = results[index];
			const balance = result.result as bigint;
			if (result && result.status !== 'failure' && balance && balance !== BigInt(0)) {
				const tokenMapKey = `${chainId}_${contract.address}`;
				const tokenData = tokenAddresses.tokenMap[tokenMapKey];
				console.log(tokenData);
				return {
					...tokenData,
					publicKey: contract.args[0],
					balance: balance,
				};
			} else {
				return null;
			}
		});

		const allBalances = nativeBalances.concat(erc20Balances).filter((item: any) => item !== null);
		return allBalances;
	},
};
