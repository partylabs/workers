import { Abi, Address, Chain, ContractFunctionConfig, getAddress } from 'viem';
import { UniswapPairSettings } from './models/uniswap-pair-settings';
import { FeeAmount } from '../../router/v3/enums/fee-amount-v3';
import { TradeDirection } from './models/trade-direction';
import { TradePath, getTradePath } from '../../../models/trade-path';

export interface UniswapPair {
	chain: Chain;
	from: Address;
	to: Address;
	settings: UniswapPairSettings;
	getPairAddress: (factoryV2: Abi) => ContractFunctionConfig[];
	getPoolAddress: (factoryV3: Abi) => ContractFunctionConfig[];
}

export class UniswapPairFactory implements UniswapPair {
	chain: Chain;
	from: Address;
	to: Address;
	settings: UniswapPairSettings;
	nativeWrappedAddress: Address;

	constructor(params: { chain: Chain; from: Address; to: Address; settings: UniswapPairSettings; nativeWrappedAddress: Address }) {
		this.chain = params.chain;
		this.from = params.from;
		this.to = params.to;
		this.settings = params.settings;
		this.nativeWrappedAddress = params.nativeWrappedAddress;
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

	public async trade(amount: string, direction: TradeDirection = TradeDirection.input): Promise<number> {
		this.executeTradePath(amount, direction);
		return 1;
	}

	private async executeTradePath(amount: string, direction: TradeDirection): Promise<number> {
		switch (this.tradePath()) {
			case TradePath.erc20ToEth:
				this.findBestPriceAndPathErc20ToEth(amount, direction);
				return 1;
			case TradePath.ethToErc20:
				this.findBestPriceAndPathEthToErc20(amount, direction);
				return 2;
			case TradePath.erc20ToErc20:
				this.findBestPriceAndPathErc20ToErc20(amount, direction);
				return 3;
			default:
				throw new Error('Invalid trade path');
		}
		return 1;
	}

	private tradePath(): TradePath {
		return getTradePath(this.from, this.to, this.nativeWrappedAddress);
	}

	private findBestPriceAndPathErc20ToEth(amount: string, direction: TradeDirection): void {
		return;
	}

	private findBestPriceAndPathEthToErc20(amount: string, direction: TradeDirection): void {
		return;
	}

	private findBestPriceAndPathErc20ToErc20(amount: string, direction: TradeDirection): void {
		return;
	}
}
