import { Token } from './token';
import { FeeAmount } from '../contract/router/v3/enums/fee-amount-v3';

export interface Pool {
	token: Token;
	fee?: FeeAmount | undefined;
}
