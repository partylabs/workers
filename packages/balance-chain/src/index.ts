export interface Env {
	LIST: R2Bucket;
	BALANCE_CHAIN_ADDRESS: Fetcher;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		try {
			const { chainId, publicKey } = (await request.json()) as {
				chainId: number;
				publicKey: string;
			};
			const r2ObjectBalance = await env.LIST.get(`${chainId}_balance.json`);
			const balanceList = JSON.parse((await r2ObjectBalance?.text()) as string);
			const tokenAddresses = balanceList.tokens.map((token: any) => token.address);
			const url = 'https://balance-chain-address.partylabs.workers.dev';

			const requestInfo: RequestInfo = new Request(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chainId: chainId,
					publicKey: publicKey,
					tokenAddresses: tokenAddresses,
				}),
			});

			const response = await env.BALANCE_CHAIN_ADDRESS.fetch(requestInfo);
			const text = await response.json();
			return new Response(JSON.stringify(text), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify({ error: error }), { status: 500 });
		}
	},
};
