import { Stake } from '../models/stake';

export const interestForRange = (dailyData, myShares: bigint) => {
	return dailyData.reduce((s, d) => s + interestForDay(d, myShares), 0n);
};

export const interestForDay = (stake: Stake, myShares: bigint) => {
	return (myShares * dayObj.payout) / dayObj.shares;
};
