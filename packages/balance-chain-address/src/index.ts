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
}

import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from 'viem/chains';
import { createPublicClient, getAddress, http, isAddress } from 'viem';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		console.log('request came in');
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const r2ObjectERC20 = await env.CONTRACTS.get('erc20.json');
		const ERC20 = JSON.parse((await r2ObjectERC20?.text()) as string);

		const { chainId, publicKey, tokenAddresses } = (await request.json()) as {
			chainId: number;
			publicKey: string;
			tokenAddresses: string[];
		};

		if (!chainId || isNaN(chainId)) {
			return new Response(JSON.stringify({ error: 'Invalid or missing chainId' }), { status: 404 });
		}
		if (!publicKey || !isAddress(publicKey)) {
			return new Response(JSON.stringify({ error: 'Invalid or missing publicKey' }), { status: 404 });
		}

		const CHAINS = {
			[mainnet.id]: mainnet,
			[optimism.id]: optimism,
			[bsc.id]: bsc,
			[polygon.id]: polygon,
			[pulsechain.id]: pulsechain,
			[base.id]: base,
			[arbitrum.id]: arbitrum,
			[avalanche.id]: avalanche,
		};

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

		const client = createPublicClient({
			chain: chain,
			transport: http(providerUrl),
		});

		const balance = await client.getBalance({
			address: getAddress(publicKey),
		});

		const erc20Contracts = tokenAddresses.map((tokenAddress: string) => {
			return {
				address: getAddress(tokenAddress),
				abi: ERC20,
				functionName: 'balanceOf',
				args: [getAddress(publicKey)],
			};
		});

		const results = await client.multicall({
			contracts: erc20Contracts,
		});

		const mappedResults: { [key: string]: any } = {};
		if (balance && balance !== BigInt(0)) {
			mappedResults[getAddress('0x0000000000000000000000000000000000000000')] = balance;
		}

		results.forEach((result: any, index: number) => {
			const balance = result.result;
			if (balance && balance !== BigInt(0)) {
				console.log(balance);
				mappedResults[tokenAddresses[index]] = balance;
			}
		});

		if (Object.keys(mappedResults).length > 0) {
			const result = {
				[`${chainId}_${getAddress(publicKey)}`]: mappedResults,
			};
			return new Response(JSON.stringify(result), { status: 200 });
		} else {
			return new Response(JSON.stringify({}), { status: 200 });
		}
	},
};
