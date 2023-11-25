export interface Env {
	MAINNET_RPC_URL: string;
}

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const ensName = pathParts[pathParts.length - 1];
		const name = normalize(ensName);

		if (name == '') {
			return new Response(JSON.stringify({ error: 'invalid name' }), { status: 404 });
		}

		const client = createPublicClient({
			chain: mainnet,
			transport: http(env.MAINNET_RPC_URL),
		});

		const ensAddress = await client.getEnsAddress({
			name: name,
		});

		if (ensAddress == null) {
			return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
		} else {
			return new Response(JSON.stringify({ publicKey: ensAddress }), { status: 200 });
		}
	},
};
