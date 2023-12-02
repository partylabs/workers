import { Stake, StakeStatus } from '../models/stake';
import { UTC_TIME, ONE_DAY_TS, ONE_EIGHTY_DAYS_TS } from './constants';

export const calculateEarlyPayout = (stake: Stake) => {
	if (UTC_TIME < stake.startTs || stake.status != StakeStatus.ACTIVE) return null;
	if (UTC_TIME > stake.endTs) return null;

	const termDelta = UTC_TIME - Number(stake.startTs);
	const scaleTerm = Number(stake.term) * ONE_DAY_TS;
	const ratio = termDelta / scaleTerm;
	return Math.pow(ratio, 2);
};

export const calculateLatePayout = (stake: Stake) => {
	if (UTC_TIME < stake.startTs || stake.status != StakeStatus.ACTIVE) return null;
	if (UTC_TIME < stake.endTs) return null;

	const termDelta = UTC_TIME - Number(stake.endTs);
	if (termDelta > ONE_EIGHTY_DAYS_TS) return 0;
	const ratio = termDelta / ONE_EIGHTY_DAYS_TS;
	return 1 - Math.pow(ratio, 3);
};
