import { Env } from '..';
import { CHAINS } from '../lib/chains';
import { UniswapPairSettings } from './factory/pair/models/uniswap-pair-settings';
import { createPublicClient, getAddress, parseAbi, http, fromHex, Abi, Address } from 'viem';
import { UniswapPair, UniswapPairFactory } from './factory/pair/uniswap-pair';
import { multicall } from 'viem/_types/actions/public/multicall';

export async function prices(tokenAddresses: Address[], chainId: string, env: Env): Promise<Response> {
	const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

	const providerURL = env[`RPC_URL_${chainId}`];

	const r2ObjectDexSettings = await env.DEX_SETTINGS.get(`DEX_${chainId}.json`);
	const dexSettings = await r2ObjectDexSettings?.json<UniswapPairSettings>();

	const nativeWrappedAddress = dexSettings?.network?.nativeWrappedTokenInfo.contractAddress;
	const usdcAddress = dexSettings?.network?.baseTokens?.usdc?.contractAddress;

	const r2ObjectUNISWAP_FACTORY_V2 = await env.CONTRACTS.get('uniswap-factory-v2.json');
	const factoryV2ABI = await r2ObjectUNISWAP_FACTORY_V2?.json<Abi>();

	const r2ObjectUNISWAP_FACTORY_V3 = await env.CONTRACTS.get('uniswap-factory-v3.json');
	const factoryV3ABI = await r2ObjectUNISWAP_FACTORY_V3?.json<Abi>();

	if (!nativeWrappedAddress) {
		return new Response(JSON.stringify({ error: 'Invalid native wrapped token' }), { status: 400 });
	}
	if (!usdcAddress) {
		return new Response(JSON.stringify({ error: 'Invalid stable coin address' }), { status: 400 });
	}
	if (!factoryV2ABI) {
		return new Response(JSON.stringify({ error: 'Invalid v2 factory contract' }), { status: 400 });
	}
	if (!factoryV3ABI) {
		return new Response(JSON.stringify({ error: 'Invalid v3 factory contract' }), { status: 400 });
	}

	const client = createPublicClient({
		chain: chain,
		transport: http(providerURL),
	});

	const allAddresses = [nativeWrappedAddress].concat(tokenAddresses);

	// const allPairs: UniswapPair[] = allTokens.map((tokenAddress: string): UniswapPair => {
	// 	return new UniswapPairFactory({
	// 		chain: chain,
	// 		from: getAddress(usdcAddress),
	// 		to: getAddress(tokenAddress),
	// 		settings: dexSettings,
	// 		nativeWrappedAddress: getAddress(nativeWrappedAddress),
	// 	});
	// });

	// const pairContracts = allPairs.flatMap((pair: UniswapPair) => {
	// 	return pair.getAllPossibleRoutes(factoryV2ABI, factoryV3ABI);
	// });

	// let results = await client.multicall({
	// 	contracts: pairContracts,
	// });

	// console.log(results);
	return new Response('Price response');
}
