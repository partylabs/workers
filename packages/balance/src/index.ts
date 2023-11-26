export interface Env {
	BALANCE_CHAIN: Fetcher;
}

import { mainnet, arbitrum, avalanche, base, bsc, optimism, polygon, pulsechain } from 'viem/chains';
import { getAddress } from 'viem';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		try {
			const CHAINS = [mainnet, arbitrum, avalanche, base, bsc, optimism, polygon, pulsechain];

			const { publicKeys } = (await request.json()) as {
				publicKeys: string[];
			};

			const url = 'https://balance-chain.partylabs.workers.dev';

			let balances = await Promise.all(
				publicKeys.map(async (publicKey) => {
					const res = await Promise.all(
						CHAINS.flatMap(async (chain) => {
							const requestInfo: RequestInfo = new Request(url, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									chainId: chain.id,
									publicKey: getAddress(publicKey),
								}),
							});

							const response = await env.BALANCE_CHAIN.fetch(url, requestInfo);
							const text = (await response.json()) as Record<string, unknown>;
							if (Object.keys(text).length === 0) {
								return null;
							} else {
								return text;
							}
						})
					).then((results) => results.filter((result) => result !== null).flat());
					return res;
				})
			).then((results) => results.flat());

			return new Response(JSON.stringify(balances), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify({ error: error }), { status: 500 });
		}
	},
};
