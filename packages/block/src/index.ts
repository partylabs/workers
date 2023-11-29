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
}

import { createPublicClient, http } from 'viem';
import { CHAINS } from './constants/chains';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const chainId = url.searchParams.get('chainId') as string;

		if (!chainId || isNaN(Number(chainId))) {
			return new Response(JSON.stringify({ error: 'Invalid or missing chainId' }), { status: 404 });
		}

		const providerURL = env[`RPC_URL_${chainId}`];
		const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

		const client = createPublicClient({
			chain: chain,
			transport: http(providerURL),
		});

		const block = await client.getBlock();

		if (block == null) {
			return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
		} else {
			return new Response(JSON.stringify(block), { status: 200 });
		}
	},
};
