import { DailyData } from '../models/daily-data';

export const interestForRange = (dailyData: DailyData[], myShares: bigint) => {
	return dailyData.reduce((s, d) => s + interestForDay(d, myShares), 0n);
};

export const interestForDay = (dayObj: DailyData, myShares: bigint) => {
	if (dayObj.shares === 0n) {
		return 0n;
	}
	return (myShares * dayObj.payout) / dayObj.shares;
};
