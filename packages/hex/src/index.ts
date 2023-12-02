export interface Env {
	[key: string]: any;

	RPC_URL_1: string;
	RPC_URL_369: string;
	RPC_URL_10001: string;

	CONTRACTS: R2Bucket;
}

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

import { Abi } from 'viem';
import { CHAINS } from './lib/chains';
import { getStakes } from './contract/stakes';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method.toUpperCase() !== 'POST') {
			return new Response(JSON.stringify({ error: 'Only POST method is supported' }), { status: 405 });
		}

		const body = await request.json();

		if (!body) {
			return new Response(JSON.stringify({ error: 'No request body' }), { status: 405 });
		}

		const { publicKeys } = body as {
			publicKeys: string[];
		};

		if (!publicKeys) {
			return new Response(JSON.stringify({ error: 'No public keys' }), { status: 405 });
		}

		const R2_HEX = await env.CONTRACTS.get('hex.json');
		const HEX_ABI = await R2_HEX?.json<Abi>();

		const R2_HEX_ADDRESS = await env.CONTRACTS.get('hex-address.json');
		const HEX_ADDRESS = await R2_HEX_ADDRESS?.json<{ [key: number]: string }>();
		if (!HEX_ABI) {
			return new Response(JSON.stringify({ error: 'No XEN Crypto ABI' }), { status: 405 });
		}

		if (!HEX_ADDRESS) {
			return new Response(JSON.stringify({ error: 'No XEN Crypto addresses' }), { status: 405 });
		}
		switch (true) {
			case request.url.endsWith('/stakes'):
				const stakesResults = await Promise.all(
					Object.keys(CHAINS).flatMap(async (chainId: string) => {
						const hexAddress = HEX_ADDRESS[Number(chainId)];
						if (!hexAddress) {
							return [];
						}
						return getStakes(publicKeys, chainId, HEX_ABI, hexAddress, env);
					})
				).then((results) => results.filter((result) => result !== null).flat());

				return new Response(JSON.stringify(stakesResults), { status: 200 });
			default:
				return new Response('Endpoint not found', { status: 404 });
		}
	},
};
