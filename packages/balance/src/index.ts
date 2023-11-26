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

			const combinations = publicKeys.flatMap((publicKey) => CHAINS.map((chain) => ({ chainId: chain.id, publicKey })));

			const results = await Promise.all(
				combinations.flatMap(async (combination) => {
					const requestInfo: RequestInfo = new Request(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(combination),
					});

					const response = await env.BALANCE_CHAIN.fetch(url, requestInfo);
					const text = (await response.json()) as Record<string, unknown>;
					if (Object.keys(text).length === 0) {
						return null;
					} else {
						return text;
					}
				})
			);

			console.log(results);

			// ).then((results) => results.filter((result) => result !== null).flat());

			return new Response(JSON.stringify({}), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify({ error: error }), { status: 500 });
		}
	},
};
