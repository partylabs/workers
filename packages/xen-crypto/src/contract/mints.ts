import { Env } from '..';
import { createPublicClient, http, Abi, getAddress } from 'viem';
import { CHAINS } from '../lib/chains';
import { Mint } from '../models/mint';

export async function getMints(
	publicKeys: string[],
	chainId: string,
	XEN_CRYPTO_ABI: Abi,
	XEN_CRYPTO_ADDRESS: string,
	env: Env
): Promise<any[]> {
	const providerURL = env[`RPC_URL_${chainId}`];
	const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

	if (!XEN_CRYPTO_ABI) {
		return [];
	}

	const client = createPublicClient({
		chain: chain,
		transport: http(providerURL),
	});

	const [gRankContract] = await client.multicall({
		contracts: [
			{
				address: getAddress(XEN_CRYPTO_ADDRESS),
				abi: XEN_CRYPTO_ABI,
				functionName: 'globalRank',
			},
		],
	});

	const gRank = Number(gRankContract.result);

	if (!gRank) {
		return [];
	}

	const userMintsContracts = publicKeys.flatMap((publicKey: string) => {
		return {
			address: getAddress(XEN_CRYPTO_ADDRESS),
			abi: XEN_CRYPTO_ABI,
			functionName: 'userMints',
			args: [getAddress(publicKey)],
		};
	});

	const userMintsContractResults = await client.multicall({
		contracts: userMintsContracts,
	});

	const userMintsYield = userMintsContractResults.flatMap((userMintsContractResults: any, index: number) => {
		const userMint = userMintsContractResults.result;
		if (!userMint) {
			return [];
		}

		const mint: Mint = {
			user: userMint[0],
			term: userMint[1],
			maturityTs: userMint[2],
			rank: userMint[3],
			amplifier: userMint[4],
			eaaRate: userMint[5],
		};

		if (mint.term === BigInt(0)) {
			return [];
		}
		const rank = Number(mint.rank);
		const term = Number(mint.term);
		const amplifier = Number(mint.amplifier);

		const EAA = 0.1 - 0.001 * (rank / 1e5);
		const mintYield = Math.log2(gRank - rank) * term * amplifier * (1 + EAA);

		return {
			publicKey: getAddress(publicKeys[index]),
			address: getAddress(XEN_CRYPTO_ADDRESS),
			chainId: chain.id,
			yield: mintYield,
			mint: mint,
		};
	});

	return userMintsYield;
}
