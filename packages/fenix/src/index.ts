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
	[key: string]: any;

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
}

import { Abi } from 'viem';
import { CHAINS } from './lib/chains';
import { getStakes } from './contract/stakes';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

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

		const R2_FENIX_CRYPTO = await env.CONTRACTS.get('fenix.json');
		const FENIX_ABI = await R2_FENIX_CRYPTO?.json<Abi>();

		const R2_FENIX_ADDRESS = await env.CONTRACTS.get('fenix-address.json');
		const FENIX_ADDRESS = await R2_FENIX_ADDRESS?.json<{ [key: number]: string }>();
		if (!FENIX_ABI) {
			return new Response(JSON.stringify({ error: 'No FENIX ABI' }), { status: 405 });
		}

		if (!FENIX_ADDRESS) {
			return new Response(JSON.stringify({ error: 'No FENIX addresses' }), { status: 405 });
		}

		switch (true) {
			case request.url.endsWith('/stakes'):
				const stakesResults = await Promise.all(
					Object.keys(CHAINS).flatMap(async (chainId: string) => {
						const fenixAddress = FENIX_ADDRESS[Number(chainId)];
						if (!fenixAddress) {
							return [];
						}
						return getStakes(publicKeys, chainId, FENIX_ABI, fenixAddress, env);
					})
				).then((results) => results.filter((result) => result !== null).flat());

				return new Response(JSON.stringify(stakesResults), { status: 200 });
			default:
				return new Response('Endpoint not found', { status: 404 });
		}
	},
};
