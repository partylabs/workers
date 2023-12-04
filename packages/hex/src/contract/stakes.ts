import { Env } from '..';
import { createPublicClient, http, Abi, getAddress, formatEther } from 'viem';
import { CHAINS } from '../lib/chains';
import { GlobalInfo } from '../models/globalInfo';
import { Stake } from '../models/stake';
import { HEARTS_MASK, HEARTS_UINT_SHIFT, SATS_MASK } from '../models/constants';
import { DailyData } from '../models/daily-data';
import { interestForRange } from '../lib/helpers';

export async function getStakes(publicKeys: string[], chainId: string, HEX_ABI: Abi, HEX_ADDRESS: string, env: Env): Promise<any[]> {
	const providerURL = env[`RPC_URL_${chainId}`];
	const chain = CHAINS[chainId as unknown as keyof typeof CHAINS];

	if (!HEX_ABI) {
		return [];
	}

	const client = createPublicClient({
		chain: chain,
		transport: http(providerURL),
	});

	const stakeCounts = publicKeys.map((publicKey) => {
		return {
			address: getAddress(HEX_ADDRESS),
			abi: HEX_ABI,
			functionName: 'stakeCount',
			args: [getAddress(publicKey)],
		};
	});

	const [globalInfoResult, ...stakeCountsResults] = (await client.multicall({
		contracts: [
			{
				address: getAddress(HEX_ADDRESS),
				abi: HEX_ABI,
				functionName: 'globalInfo',
			},
			...stakeCounts,
		],
	})) as unknown as [any, ...any[]];

	const globalInfo: GlobalInfo = {
		lockedHeartsTotal: globalInfoResult.result[0],
		nextStakeSharesTotal: globalInfoResult.result[1],
		shareRate: globalInfoResult.result[2],
		stakePenaltyTotal: globalInfoResult.result[3],
		currentDay: globalInfoResult.result[4],
		stakeSharesTotal: globalInfoResult.result[5],
		latestStakeId: globalInfoResult.result[6],
		unclaimedSatoshisTotal: globalInfoResult.result[7],
		claimedSatoshisTotal: globalInfoResult.result[8],
		claimedBtcAddrCount: globalInfoResult.result[9],
		blockTimestamp: globalInfoResult.result[10],
		totalSupply: globalInfoResult.result[11],
		transferLobby: globalInfoResult.result[13],
	};

	let currentDay = Number(globalInfo.currentDay);
	let startDay = Math.max(currentDay - 5555, 0);

	const stakeListsContracts = publicKeys.flatMap((publicKey: string, index: number) => {
		const stakeCount = stakeCountsResults[index].result;

		if (stakeCount === BigInt(0)) {
			return [];
		}

		return Array.from({ length: Number(stakeCount) }, (_, i) => {
			return {
				publicKey: getAddress(publicKey),
				stakeIndex: i,
				stakeLists: {
					address: getAddress(HEX_ADDRESS),
					abi: HEX_ABI,
					functionName: 'stakeLists',
					args: [getAddress(publicKey), i],
				},
			};
		});
	});

	if (stakeListsContracts.length == 0) {
		return [];
	}

	const [dailyDataRangeResult, ...stakeListsContractsResults] = (await client.multicall({
		contracts: [
			{
				address: getAddress(HEX_ADDRESS),
				abi: HEX_ABI,
				functionName: 'dailyDataRange',
				args: [Number(startDay), Number(currentDay)],
			},
			...stakeListsContracts.map((stakeListsContract: any) => stakeListsContract.stakeLists),
		],
	})) as unknown as [any, ...any[]];

	const dailyDataRange = (dailyDataRangeResult.result as bigint[]).map((dailyDataDay: bigint) => {
		let v = dailyDataDay;
		let payout = v & HEARTS_MASK;
		v = v >> HEARTS_UINT_SHIFT;
		let shares = v & HEARTS_MASK;
		v = v >> HEARTS_UINT_SHIFT;
		let sats = v & SATS_MASK;
		const dailyData: DailyData = {
			payout: payout,
			shares: shares,
			sats: sats,
		};
		return dailyData;
	});

	const userStakesYield = stakeListsContractsResults.flatMap((stakeListsContractsResult: any, index: number) => {
		const stakeResult = stakeListsContractsResult.result;
		if (!stakeResult) {
			return [];
		}

		const stake: Stake = {
			stakeId: stakeResult[0],
			stakedHearts: stakeResult[1],
			stakeShares: stakeResult[2],
			lockedDay: stakeResult[3],
			stakedDays: stakeResult[4],
			unlockedDay: stakeResult[5],
			isAutoStake: stakeResult[6],
		};

		const stakeYield = interestForRange(dailyDataRange, stake.stakeShares);

		const { stakeIndex, publicKey } = stakeListsContracts[index];

		return {
			stakeIndex: stakeIndex,
			publicKey: publicKey,
			address: getAddress(HEX_ADDRESS),
			chainId: chain.id,
			yield: stakeYield,
			stake: stake,
		};
	});

	return userStakesYield;
}
