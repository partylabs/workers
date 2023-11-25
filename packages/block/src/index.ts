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
}

import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain, zkSync } from 'viem/chains';
import { createPublicClient, http } from 'viem';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const chainId = url.searchParams.get('chainId');

		if (!chainId || isNaN(Number(chainId))) {
			return new Response(JSON.stringify({ error: 'Invalid or missing chainId' }), { status: 404 });
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

		let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
		let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];

		const client = createPublicClient({
			chain: mainnet,
			transport: http(env.MAINNET_RPC_URL),
		});

		const block = await client.getBlock();

		if (block == null) {
			return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
		} else {
			return new Response(JSON.stringify(block), { status: 200 });
		}
	},
};
