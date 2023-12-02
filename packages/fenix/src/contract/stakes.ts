import { Env } from '..';
import { createPublicClient, http, Abi, getAddress, formatEther } from 'viem';
import { CHAINS } from '../lib/chains';
import { Stake, StakeStatus } from '../models/stake';
import { calculateEarlyPayout, calculateLatePayout } from '../lib/helpers';

export async function getStakes(publicKeys: string[], chainId: string, FENIX_ABI: Abi, FENIX_ADDRESS: string, env: Env): Promise<any[]> {
	const providerURL = env[`RPC_URL_${chainId}`];
	const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

	if (!FENIX_ABI) {
		return [];
	}

	const client = createPublicClient({
		chain: chain,
		transport: http(providerURL),
	});

	const globalFunctions = ['genesisTs', 'shareRate', 'equityPoolSupply', 'equityPoolTotalShares', 'rewardPoolSupply'];
	const globalFunctionContracts = globalFunctions.map((functionName: string) => {
		return {
			address: getAddress(FENIX_ADDRESS),
			abi: FENIX_ABI,
			functionName: functionName,
		};
	});

	const stakeCountContracts = publicKeys.map((publicKey: string) => {
		return {
			address: getAddress(FENIX_ADDRESS),
			abi: FENIX_ABI,
			functionName: 'stakeCount',
			args: [getAddress(publicKey)],
		};
	});

	const contracts = globalFunctionContracts.concat(stakeCountContracts);

	const [
		genesisTsResult,
		shareRateResult,
		equityPoolSupplyResult,
		equityPoolTotalSharesResult,
		rewardPoolSupplyResult,
		...stakeCountResults
	] = await client.multicall({
		contracts: contracts,
	});

	// console.log(stakeCountResults);

	const stakeForContracts = publicKeys.flatMap((publicKey: string, index: number) => {
		const stakeCount = stakeCountResults[index].result as bigint;
		if (stakeCount === BigInt(0)) {
			return [];
		}

		return Array.from({ length: Number(stakeCount) }, (_, i) => {
			return {
				publicKey: getAddress(publicKey),
				stakeId: i,
				stakeFor: {
					address: getAddress(FENIX_ADDRESS),
					abi: FENIX_ABI,
					functionName: 'stakeFor',
					args: [getAddress(publicKey), i],
				},
			};
		});
	});

	if (stakeForContracts.length == 0) {
		return [];
	}

	const stakeForContractsResults = await client.multicall({
		contracts: stakeForContracts.map((stakeForContract: any) => stakeForContract.stakeFor),
	});

	const userStakesYield = stakeForContractsResults.flatMap((stakeForContractsResult: any, index: number) => {
		const stake = stakeForContractsResult.result as Stake;
		if (!stake) {
			return [];
		}

		let penalty = 0;
		const earlyPayout = calculateEarlyPayout(stake);
		if (earlyPayout) {
			penalty = 1 - earlyPayout;
		}

		const latePayout = calculateLatePayout(stake);
		if (latePayout) {
			penalty = 1 - latePayout;
		}

		const stakeShares = Number(formatEther(stake.shares as bigint));
		const equityPoolTotalShares = Number(formatEther(equityPoolTotalSharesResult.result as bigint));
		const equityPoolSupply = Number(formatEther(equityPoolSupplyResult.result as bigint));
		const equityPayout = (stakeShares / equityPoolTotalShares) * equityPoolSupply;
		const stakeYield = equityPayout * (1 - penalty);

		const { stakeId, publicKey } = stakeForContracts[index];

		return {
			stakeId: stakeId,
			publicKey: publicKey,
			address: getAddress(FENIX_ADDRESS),
			chainId: chain.id,
			yield: stakeYield,
			stake: stake,
		};
	});

	return userStakesYield;
}
