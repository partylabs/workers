export const enum StakeStatus {
	ACTIVE = 0,
	DEFER = 1,
	END = 2,
	ALL = 3,
}

export interface Stake {
	status: StakeStatus;
	startTs: bigint;
	deferralTs: bigint;
	endTs: bigint;
	term: bigint;
	fenix: bigint;
	shares: bigint;
	payout: bigint;
}
