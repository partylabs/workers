export interface Env {
	[key: string]: any;

	RPC_URL_1: string;
	RPC_URL_10: string;
	RPC_URL_137: string;
	RPC_URL_250: string;
	RPC_URL_324: string;
	RPC_URL_369: string;
	RPC_URL_42161: string;
	RPC_URL_43114: string;
	RPC_URL_56: string;
	RPC_URL_8453: string;

	CONTRACTS: R2Bucket;
}

import { createPublicClient, getAddress, http, fromHex, Abi, Address } from 'viem';
import { CHAINS } from './lib/chains';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const { chainId, addresses } = (await request.json()) as {
			chainId: string;
			addresses: string[];
		};

		const R2_ERC20 = await env.CONTRACTS.get('erc20.json');
		const ERC20 = await R2_ERC20?.json<Abi>();

		if (!ERC20) {
			return new Response(JSON.stringify({ error: 'No ERC20 ABI' }), { status: 405 });
		}

		const tokenList = await this.getTokenList(addresses, chainId, ERC20, env);

		return new Response(JSON.stringify(tokenList), { status: 200 });
	},

	async getTokenList(erc20Addresses: string[], chainId: string, ERC20: Abi, env: Env) {
		const providerURL = env[`RPC_URL_${chainId}`];
		const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

		const erc20Promises = erc20Addresses.map((erc20Address) => {
			const tokenABI = {
				address: getAddress(erc20Address),
				abi: ERC20,
			};

			const client = createPublicClient({
				chain: chain,
				transport: http(providerURL),
			});

			return client
				.multicall({
					contracts: [
						{
							...tokenABI,
							functionName: 'name',
						},
						{
							...tokenABI,
							functionName: 'symbol',
						},
						{
							...tokenABI,
							functionName: 'decimals',
						},
					],
				})
				.then((tokenData) => {
					return {
						chainId: chain.id,
						address: getAddress(erc20Address),
						name: tokenData[0].result,
						symbol: tokenData[1].result,
						decimals: tokenData[2].result,
						logoURI: 'https://token.partylabs.org/' + erc20Address.toLowerCase() + '.webp',
					};
				});
		});

		let erc20s = (await Promise.all(erc20Promises)).filter(
			(token) => token.name !== undefined || token.symbol !== undefined || token.decimals !== undefined
		);

		let erc20Map: any = {};
		for (let token of erc20s) {
			let key = `${token.chainId}_${token.address}`;
			erc20Map[key] = token;
		}

		const tokenList = {
			name: 'party-tokens',
			timestamp: Date.now(),
			version: {
				major: 1,
				minor: 0,
				patch: 0,
			},
			keywords: ['party', 'token', 'list'],
			tokens: erc20s,
			tokenMap: erc20Map,
		};

		return tokenList;
	},
};
