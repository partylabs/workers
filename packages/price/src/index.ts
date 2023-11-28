/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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
import { DEXES } from './lib/dexes';
import { CHAINS } from './lib/chains';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const body = (await request.json()) as { [key: string]: string[] };

		const prices = await Promise.all(
			Object.keys(body).flatMap(async (chainId: string) => {
				const tokens = body[chainId];
				return await this.getPrices(tokens, chainId, env);
			})
		).then((results) => results.filter((result) => result !== null).flat());

		return new Response(JSON.stringify(prices), { status: 200 });
	},

	async getPrices(tokens: string[], chainId: string, env: Env) {
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
		const dexSettings = DEXES[chainId as unknown as keyof typeof DEXES];
		const providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];

		const r2ObjectBalance = await env.LIST.get(`${chainId}_balance.json`);
		const tokenAddresses = (await r2ObjectBalance?.json()) as any;

		const nativeWrappedAddress = dexSettings.customNetwork?.nativeWrappedTokenInfo.contractAddress;
		const usdcAddress = dexSettings.customNetwork?.baseTokens?.usdc?.contractAddress;

		if (!nativeWrappedAddress) {
			return { error: 'Invalid native wrapped token' };
		}
		if (!usdcAddress) {
			return { error: 'Invalid stable coin address' };
		}

		const allTokens = [nativeWrappedAddress].concat(tokens);

		const results = await Promise.all(
			allTokens.map(async (token: string, index: number) => {
				// const uniswapPair = new UniswapPair({
				// 	providerUrl: providerUrl,
				// 	fromTokenContractAddress: usdcAddress,
				// 	toTokenContractAddress: token,
				// 	ethereumAddress: '0x0000000000000000000000000000000000000000',
				// 	chainId: chain.id,
				// 	// settings: dexSettings,
				// });
				// try {
				// 	const factory = await uniswapPair.createFactory();
				// 	// const trade = await factory.trade('10');
				// 	// console.log(trade);
				// 	// const quote = Number(trade.expectedConvertQuote);
				// 	// return 10 / quote;
				// 	return 0;
				// } catch (error) {
				// 	console.log(error);
				// 	return 0;
				// }
			})
		);

		// console.log(results);
		// var quotes = results.flatMap((quote: any, index, number) => {
		// 	if (!quote || quote.status === 'failure') {
		// 		return null;
		// 	}

		// 	return {};
		// });

		return {};
	},
};
