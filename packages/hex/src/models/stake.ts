export interface Stake {
	stakeId: number;
	stakedHearts: bigint;
	stakeShares: bigint;
	lockedDay: number;
	stakedDays: number;
	unlockedDay: number;
	isAutoStake: boolean;
}
