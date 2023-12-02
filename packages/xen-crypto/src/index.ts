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
import { getMints } from './contract/mints';
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

		const R2_XEN_CRYPTO = await env.CONTRACTS.get('xen-crypto.json');
		const XEN_CRYPTO_ABI = await R2_XEN_CRYPTO?.json<Abi>();

		const R2_XEN_CRYPTO_ADDRESS = await env.CONTRACTS.get('xen-crypto-address.json');
		const XEN_CRYPTO_ADDRESS = await R2_XEN_CRYPTO_ADDRESS?.json<{ [key: number]: string }>();
		if (!XEN_CRYPTO_ABI) {
			return new Response(JSON.stringify({ error: 'No XEN Crypto ABI' }), { status: 405 });
		}

		if (!XEN_CRYPTO_ADDRESS) {
			return new Response(JSON.stringify({ error: 'No XEN Crypto addresses' }), { status: 405 });
		}

		switch (true) {
			case request.url.endsWith('/mints'):
				const mintsResults = await Promise.all(
					Object.keys(CHAINS).flatMap(async (chainId: string) => {
						const xenCryptoAddress = XEN_CRYPTO_ADDRESS[Number(chainId)];
						if (!xenCryptoAddress) {
							return [];
						}
						return getMints(publicKeys, chainId, XEN_CRYPTO_ABI, xenCryptoAddress, env);
					})
				).then((results) => results.filter((result) => result !== null).flat());

				return new Response(JSON.stringify(mintsResults), { status: 200 });
			case request.url.endsWith('/stakes'):
				const stakesResults = await Promise.all(
					Object.keys(CHAINS).flatMap(async (chainId: string) => {
						const xenCryptoAddress = XEN_CRYPTO_ADDRESS[Number(chainId)];
						if (!xenCryptoAddress) {
							return [];
						}
						return getStakes(publicKeys, chainId, XEN_CRYPTO_ABI, xenCryptoAddress, env);
					})
				).then((results) => results.filter((result) => result !== null).flat());

				return new Response(JSON.stringify(stakesResults), { status: 200 });
			default:
				return new Response('Endpoint not found', { status: 404 });
		}
	},
};
