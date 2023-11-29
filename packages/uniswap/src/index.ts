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

	CONTRACTS: R2Bucket;
	LIST: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		switch (true) {
			case request.url.endsWith('/prices'):
				return new Response('Price response');
			case request.url.endsWith('/liquidity-positions'):
				return new Response('Liquidity positions response');
			default:
				return new Response('Not found', { status: 404 });
		}
	},
};
