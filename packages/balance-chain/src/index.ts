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
	LIST: R2Bucket;

	BALANCE_CHAIN_ADDRESS: Fetcher;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const { chainId, publicKey } = (await request.json()) as {
			chainId: number;
			publicKey: string;
		};

		const r2ObjectBalance = await env.LIST.get('balance.json');
		const balanceList = JSON.parse((await r2ObjectBalance?.text()) as string);

		parseInt(balanceList);

		return new Response('Hello World!');
	},
};
