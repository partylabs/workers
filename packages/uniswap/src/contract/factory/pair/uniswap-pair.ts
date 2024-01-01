import { Abi, Address, Chain, ContractFunctionConfig, getAddress, isAddressEqual } from 'viem';
import { UniswapPairSettings } from './models/uniswap-pair-settings';
import { FeeAmount } from '../../router/v3/enums/fee-amount-v3';
import { TradeDirection } from './models/trade-direction';
import { TradePath, getTradePath } from '../../../models/trade-path';
import { UniswapRouter } from '../../router/uniswap-router';
import { Token } from '../../../models/token';
import { UniswapVersion } from '../../../models/uniswap-version';

export interface UniswapPair {
	chain: Chain;
	fromToken: Token;
	toToken: Token;
	settings: UniswapPairSettings;
	router: UniswapRouter;
	// getAllPossibleRoutes: (factoryV2: Abi, factoryV3: Abi) => ContractFunctionConfig[];
	// getPairAddress: (factoryV2: Abi) => ContractFunctionConfig[];
	// getPoolAddress: (factoryV3: Abi) => ContractFunctionConfig[];
}

export class UniswapPairFactory implements UniswapPair {
	chain: Chain;
	fromToken: Token;
	toToken: Token;
	settings: UniswapPairSettings;
	router: UniswapRouter;
	nativeWrappedAddress: Address;

	constructor(params: { chain: Chain; fromToken: Token; toToken: Token; settings: UniswapPairSettings; nativeWrappedAddress: Address }) {
		this.chain = params.chain;
		this.fromToken = params.fromToken;
		this.toToken = params.toToken;
		this.settings = params.settings;
		this.router = new UniswapRouter(params.fromToken, params.toToken, params.settings);
		this.nativeWrappedAddress = params.nativeWrappedAddress;
	}

	// getPairAddress(factoryV2: Abi): ContractFunctionConfig[] {
	// 	const factoryAddress = this.settings.cloneUniswapContractDetails?.v2Override?.factoryAddress;
	// 	if (factoryAddress) {
	// 		return [
	// 			{
	// 				address: getAddress(factoryAddress),
	// 				abi: factoryV2,
	// 				functionName: 'getPair',
	// 				args: [this.fromToken, this.toToken],
	// 			},
	// 		];
	// 	}
	// 	return [];
	// }

	// getPoolAddress(factoryV3: Abi): ContractFunctionConfig[] {
	// 	const factoryAddress = this.settings.cloneUniswapContractDetails?.v3Override?.factoryAddress;
	// 	if (factoryAddress) {
	// 		[FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map((feeAmount) => {
	// 			return {
	// 				address: getAddress(factoryAddress),
	// 				abi: factoryV3,
	// 				functionName: 'getPool',
	// 				args: [this.fromToken, this.toToken, feeAmount],
	// 			};
	// 		});
	// 	}
	// 	return [];
	// }
}
