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
import { createPublicClient, getAddress, parseAbi, http, fromHex, Abi } from 'viem';
import { DEXES } from './lib/dexes';
import { CHAINS } from './lib/chains';
import { UniswapABIs } from './types/uniswap-abis';
import { UniswapPair, UniswapPairFactory } from './types/uniswap-pair';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const body = (await request.json()) as { [key: string]: string[] };

		const ABIs: UniswapABIs = await this.loadABI(env);

		const prices = await Promise.all(
			Object.keys(body).flatMap(async (chainId: string) => {
				const tokens = body[chainId];
				return await this.getPrices(tokens, chainId, ABIs, env);
			})
		).then((results) => results.filter((result) => result !== null).flat());

		return new Response(JSON.stringify(prices), { status: 200 });
	},

	async loadABI(env: Env): Promise<UniswapABIs> {
		const r2ObjectUNISWAP_PAIR_V2 = await env.CONTRACTS.get('uniswap-pair-v2.json');
		const r2ObjectUNISWAP_FACTORY_V2 = await env.CONTRACTS.get('uniswap-factory-v2.json');
		const r2ObjectUNISWAP_ROUTER_V2 = await env.CONTRACTS.get('uniswap-router-v2.json');

		const r2ObjectUNISWAP_QUOTER_V3 = await env.CONTRACTS.get('uniswap-quoter-v3.json');
		const r2ObjectUNISWAP_FACTORY_V3 = await env.CONTRACTS.get('uniswap-factory-v3.json');
		const r2ObjectUNISWAP_ROUTER_V3 = await env.CONTRACTS.get('uniswap-router-v3.json');

		return {
			pairV2: await r2ObjectUNISWAP_PAIR_V2?.json<Abi>(),
			factoryV2: await r2ObjectUNISWAP_FACTORY_V2?.json<Abi>(),
			routerV2: await r2ObjectUNISWAP_ROUTER_V2?.json<Abi>(),
			quoterV3: await r2ObjectUNISWAP_QUOTER_V3?.json<Abi>(),
			factoryV3: await r2ObjectUNISWAP_FACTORY_V3?.json<Abi>(),
			routerV3: await r2ObjectUNISWAP_ROUTER_V3?.json<Abi>(),
		} as UniswapABIs;
	},

	async getPrices(tokens: string[], chainId: string, ABIs: UniswapABIs, env: Env) {
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

		const client = createPublicClient({
			chain: chain,
			transport: http(providerUrl),
		});

		const allTokens = [nativeWrappedAddress].concat(tokens);

		const allPairs: UniswapPair[] = allTokens.map((tokenAddress: string): UniswapPair => {
			return new UniswapPairFactory({
				from: getAddress(usdcAddress),
				to: getAddress(tokenAddress),
				settings: dexSettings,
			});
		});

		const pairContracts = allPairs.flatMap((pair: UniswapPair) => {
			return pair.getPairAddress(ABIs.factoryV2).concat(pair.getPoolAddress(ABIs.factoryV3));
		});

		let results = await client.multicall({
			contracts: pairContracts,
		});

		console.log(results);

		return {};
	},
};
