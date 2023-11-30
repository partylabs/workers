import { Abi, Address, ContractFunctionConfig, getAddress } from 'viem';
import { UniswapPairSettings } from './models/uniswap-pair-settings';
import { FeeAmount } from '../../router/v3/enums/fee-amount-v3';

export interface UniswapPair {
	from: Address;
	to: Address;
	settings: UniswapPairSettings;
	getPairAddress: (factoryV2: Abi) => ContractFunctionConfig[];
	getPoolAddress: (factoryV3: Abi) => ContractFunctionConfig[];
}

export class UniswapPairFactory implements UniswapPair {
	from: `0x${string}`;
	to: `0x${string}`;
	settings: UniswapPairSettings;

	constructor(params: { from: Address; to: Address; settings: UniswapPairSettings }) {
		this.from = params.from;
		this.to = params.to;
		this.settings = params.settings;
	}

	getPairAddress(factoryV2: Abi): ContractFunctionConfig[] {
		const factoryAddress = this.settings.cloneUniswapContractDetails?.v2Override?.factoryAddress;
		if (factoryAddress) {
			return [
				{
					address: getAddress(factoryAddress),
					abi: factoryV2,
					functionName: 'getPair',
					args: [this.from, this.to],
				},
			];
		}
		return [];
	}

	getPoolAddress(factoryV3: Abi): ContractFunctionConfig[] {
		const factoryAddress = this.settings.cloneUniswapContractDetails?.v3Override?.factoryAddress;
		if (factoryAddress) {
			[FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map((feeAmount) => {
				return {
					address: getAddress(factoryAddress),
					abi: factoryV3,
					functionName: 'getPool',
					args: [this.from, this.to, feeAmount],
				};
			});
		}
		return [];
	}
}
