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

	LIST: R2Bucket;
	CONTRACTS: R2Bucket;
}

import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain, zkSync, fantom } from 'viem/chains';
import { createPublicClient, http, getAddress } from 'viem';
import { PublicKeys, Balance } from './types';
import { CHAINS } from './lib/chains';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}
		const { publicKeys } = (await request.json()) as PublicKeys;

		const r2ObjectBalance = await env.LIST.get('balance.json');
		const balanceList = JSON.parse((await r2ObjectBalance?.text()) as string);

		const r2ObjectERC20 = await env.CONTRACTS.get('erc20.json');
		const ERC20 = JSON.parse((await r2ObjectERC20?.text()) as string);

		const getBalances = async (chainId: string) => {
			const RPCS = {
				[mainnet.id]: env.MAINNET_RPC_URL,
				[optimism.id]: env.OPTIMISM_RPC_URL,
				[bsc.id]: env.BSC_RPC_URL,
				[polygon.id]: env.POLYGON_RPC_URL,
				[fantom.id]: env.FANTOM_RPC_URL,
				[zkSync.id]: env.ZKSYNC_RPC_URL,
				[pulsechain.id]: env.PULSECHAIN_RPC_URL,
				[base.id]: env.BASE_RPC_URL,
				[arbitrum.id]: env.ARBITRUM_RPC_URL,
				[avalanche.id]: env.AVALANCHE_RPC_URL,
			};

			let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
			let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];

			const client = createPublicClient({
				chain: chain,
				transport: http(providerUrl),
			});

			const tokenAddresses = balanceList.tokens
				.filter((token: any) => token.chainId == chain.id)
				.map((token: any) => {
					return token.address;
				});

			const erc20Contracts = publicKeys.flatMap((publicKey: string) => {
				return tokenAddresses.map((tokenAddress: string) => {
					return {
						address: getAddress(tokenAddress),
						abi: ERC20,
						functionName: 'balanceOf',
						args: [getAddress(publicKey)],
					};
				});
			});

			const results = await client.multicall({
				contracts: erc20Contracts,
			});

			const erc20Balances = erc20Contracts.map((contract: any, index: number) => {
				let result = results[index];
				if (result && result.status !== 'failure' && result.result !== BigInt(0)) {
					const tokenMapKey = `${chainId}_${contract.address}`;
					const tokenData = balanceList.tokenMap[tokenMapKey as keyof typeof balanceList.tokenMap];
					return {
						...tokenData,
						publicKey: contract.args[0],
						address: contract.address,
						units: result.result?.toString() ?? '0',
					};
				} else {
					return null;
				}
			});

			return erc20Balances.filter((item: any) => item !== null);
		};

		const balances = await Promise.all(
			Object.keys(CHAINS).flatMap(async (chainId) => {
				return await getBalances(chainId);
			})
		).then((results) => results.flat());

		return new Response(JSON.stringify(balances), { status: 200 });
	},
};
