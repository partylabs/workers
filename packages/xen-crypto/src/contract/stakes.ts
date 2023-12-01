import { Env } from '..';
import { createPublicClient, http, Abi, getAddress, formatEther } from 'viem';
import { CHAINS } from '../lib/chains';
import { Stake } from '../models/stake';

export async function getStakes(
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

	const gRank = gRankContract.result;

	if (!gRank) {
		return [];
	}

	const userStakesContracts = publicKeys.flatMap((publicKey: string) => {
		return {
			address: getAddress(XEN_CRYPTO_ADDRESS),
			abi: XEN_CRYPTO_ABI,
			functionName: 'userStakes',
			args: [getAddress(publicKey)],
		};
	});

	const userStakesContractResults = await client.multicall({
		contracts: userStakesContracts,
	});

	const userStakesYield = userStakesContractResults.flatMap((userStakesContractResult: any, index: number) => {
		const userStake = userStakesContractResult.result;
		if (!userStake) {
			return [];
		}

		const stake: Stake = {
			term: userStake[0],
			maturityTs: userStake[1],
			amount: userStake[2],
			apy: userStake[3],
		};

		if (stake.term === BigInt(0)) {
			return [];
		}

		const amount = Number(formatEther(stake.amount));
		const apy = Number(stake.apy);
		const term = Number(stake.term);
		const stakeYield = (amount * apy * term) / (100 / 365);

		return {
			publicKey: getAddress(publicKeys[index]),
			address: getAddress(XEN_CRYPTO_ADDRESS),
			chainId: chain.id,
			yield: stakeYield,
			stake: stake,
		};
	});

	return userStakesYield;
}
