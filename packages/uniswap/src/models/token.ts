import { Address } from 'viem';

export interface Token {
	chainId: number;
	contractAddress: Address;
	decimals: number;
	symbol: string;
	name: string;
}
