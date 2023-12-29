export interface Env {
	// [key: string]: any;

	RPC_URL_1: string;
	RPC_URL_10: string;
	RPC_URL_137: string;
	RPC_URL_250: string;
	RPC_URL_324: string;
	RPC_URL_369: string;
	RPC_URL_42161: string;
	RPC_URL_43114: string;
	RPC_URL_56: string;
	RPC_URL_8453: string;

	CONTRACTS: R2Bucket;
	// LIST: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const { publicKeys } = (await request.json()) as {
			publicKeys: string[];
		};

		const R2_ERC721 = await env.CONTRACTS.get('erc721.json');
		const ERC721 = (await R2_ERC721?.json()) as string;

		const R2_ERC1155 = await env.CONTRACTS.get('erc1155.json');
		const ERC1155 = (await R2_ERC1155?.json()) as string;

		return new Response('Hello World!');
	},
};
