export interface Env {
	[key: string]: any;

	RPC_URL_1: string;
	RPC_URL_10: string;
	RPC_URL_137: string;
	RPC_URL_250: string;
	RPC_URL_324: string;
	RPC_URL_359: string;
	RPC_URL_42161: string;
	RPC_URL_43114: string;
	RPC_URL_56: string;
	RPC_URL_8453: string;

	CONTRACTS: R2Bucket;
	LIST: R2Bucket;
}

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

		const R2_ERC20 = await env.CONTRACTS.get('erc20.json');
		const ERC20 = (await R2_ERC20?.json()) as string;

		const balances = await Promise.all(
			Object.keys(CHAINS).flatMap(async (chainId) => {
				return await this.getBalances(publicKeys, chainId, ERC20, env);
			})
		).then((results) => results.filter((result) => result !== null).flat());

		return new Response(JSON.stringify(balances), { status: 200 });
	},

	async getBalances(publicKeys: string[], chainId: string, ERC20: string, env: Env) {
		const providerURL = env[`RPC_URL_${chainId}`];
		const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

		const r2ObjectBalance = await env.LIST.get(`${chainId}_balance.json`);
		const tokenAddresses = (await r2ObjectBalance?.json()) as any;

		const client = createPublicClient({
			chain: chain,
			transport: http(providerURL),
		});

		const bodyRequest = publicKeys.map((publicKey: string, index: number) => {
			return {
				method: 'eth_getBalance',
				params: [publicKey, 'latest'],
				id: index,
				jsonrpc: '2.0',
			};
		});

		const request = new Request(providerURL, {
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
				return {
					...tokenData,
					publicKey: contract.args[0],
					balance: balance,
				};
			} else {
				return null;
			}
		});

		return nativeBalances.concat(erc20Balances).filter((item: any) => item !== null);
	},
};
