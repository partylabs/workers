import { Address } from 'viem';
import { UniswapPairSettings } from './uniswap-pair-settings';

export class UniswapPair {
	from: Address;
	to: Address;
	settings: UniswapPairSettings;

	constructor(params: { from: Address; to: Address; settings: UniswapPairSettings }) {
		this.from = params.from;
		this.to = params.to;
		this.settings = params.settings;
	}
}
