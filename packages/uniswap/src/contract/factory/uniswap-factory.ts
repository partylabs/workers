import { Abi, Address, Chain, ContractFunctionConfig, getAddress, isAddressEqual } from 'viem';
import { Token } from '../../models/token';
import { UniswapPairSettings } from './pair/models/uniswap-pair-settings';
import { UniswapRouter } from '../router/uniswap-router';
import { UniswapVersion } from '../../models/uniswap-version';
import { FeeAmount } from '../router/v3/enums/fee-amount-v3';
import { TradePath, getTradePath } from '../../models/trade-path';
import { TradeDirection } from './pair/models/trade-direction';

export class UniswapFactory {
	fromToken: Token;
	toToken: Token;
	settings: UniswapPairSettings;
	router: UniswapRouter;
	nativeWrappedAddress: Address;

	constructor(params: { chain: Chain; fromToken: Token; toToken: Token; settings: UniswapPairSettings; nativeWrappedAddress: Address }) {
		this.fromToken = params.fromToken;
		this.toToken = params.toToken;
		this.settings = params.settings;
		this.router = new UniswapRouter(params.fromToken, params.toToken, params.settings);
		this.nativeWrappedAddress = params.nativeWrappedAddress;
	}

	public getAllPossibleRoutes(factoryV2: Abi, factoryV3: Abi): ContractFunctionConfig[] {
		let findPairs: Token[][][] = [];

		switch (this.settings.disableMultihop) {
			case true:
				findPairs = [
					this.mainCurrenciesPairsForFromToken,
					this.mainCurrenciesPairsForToToken,
					this.mainCurrenciesPairsForUSDT,
					this.mainCurrenciesPairsForCOMP,
					this.mainCurrenciesPairsForDAI,
					this.mainCurrenciesPairsForUSDC,
					this.mainCurrenciesPairsForWETH,
					this.mainCurrenciesPairsForWBTC,
					[[this.fromToken, this.toToken]],
				];
				break;
			case false:
				findPairs = [[[this.fromToken, this.toToken]]];
				break;
		}

		// console.log('find Pairs', JSON.stringify(findPairs, null, 4));

		const factoryAddressV2 = this.settings.cloneUniswapContractDetails?.v2Override?.factoryAddress;
		const factoryAddressV3 = this.settings.cloneUniswapContractDetails?.v3Override?.factoryAddress;

		const allCalls: ContractFunctionConfig[] = [];

		if (this.settings.uniswapVersions.includes(UniswapVersion.v2) && factoryAddressV2) {
			for (let pairs = 0; pairs < findPairs.length; pairs++) {
				for (let tokenPairs = 0; tokenPairs < findPairs[pairs].length; tokenPairs++) {
					const fromToken = findPairs[pairs][tokenPairs][0];
					const toToken = findPairs[pairs][tokenPairs][1];
					if (isAddressEqual(fromToken.contractAddress, toToken.contractAddress)) continue;

					allCalls.push({
						// reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}`,
						address: getAddress(factoryAddressV2),
						abi: factoryV2,
						functionName: 'getPair',
						args: [fromToken.contractAddress, toToken.contractAddress],
					});
				}
			}
		}

		if (this.settings.uniswapVersions.includes(UniswapVersion.v3) && factoryAddressV3) {
			for (let pairs = 0; pairs < findPairs.length; pairs++) {
				for (let tokenPairs = 0; tokenPairs < findPairs[pairs].length; tokenPairs++) {
					const fromToken = findPairs[pairs][tokenPairs][0];
					const toToken = findPairs[pairs][tokenPairs][1];

					if (isAddressEqual(fromToken.contractAddress, toToken.contractAddress)) continue;

					for (let fee = 0; fee < 3; fee++) {
						const feeAmount = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH][fee];
						allCalls.push({
							// reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-${feeAmount}`,
							address: getAddress(factoryAddressV3),
							abi: factoryV3,
							functionName: 'getPool',
							args: [fromToken.contractAddress, toToken.contractAddress, feeAmount],
						});
					}
				}
			}
		}

		return allCalls;
	}

	private get mainCurrenciesPairsForFromToken(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs = [
			[this.fromToken, baseTokens?.usdt],
			[this.fromToken, baseTokens?.comp],
			[this.fromToken, baseTokens?.dai],
			[this.fromToken, baseTokens?.usdc],
			[this.fromToken, baseTokens?.wbtc],
			[this.fromToken, this.settings.network.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs).filter((t) => t[0].contractAddress !== t[1].contractAddress);
	}

	private get mainCurrenciesPairsForToToken(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs = [
			[baseTokens?.usdt, this.toToken],
			[baseTokens?.comp, this.toToken],
			[baseTokens?.dai, this.toToken],
			[baseTokens?.usdc, this.toToken],
			[baseTokens?.wbtc, this.toToken],
			[this.settings.network.nativeWrappedTokenInfo, this.toToken],
		];
		return this.filterUndefinedTokens(pairs).filter((t) => t[0].contractAddress !== t[1].contractAddress);
	}

	private get mainCurrenciesPairsForUSDT(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[baseTokens?.usdt, baseTokens?.comp],
			[baseTokens?.usdt, baseTokens?.dai],
			[baseTokens?.usdt, baseTokens?.usdc],
			[baseTokens?.usdt, baseTokens?.wbtc],
			[baseTokens?.usdt, this.settings.network?.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private get mainCurrenciesPairsForCOMP(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[baseTokens?.comp, baseTokens?.usdt],
			[baseTokens?.comp, baseTokens?.dai],
			[baseTokens?.comp, baseTokens?.usdc],
			[baseTokens?.comp, this.settings.network.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private get mainCurrenciesPairsForDAI(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[baseTokens?.dai, baseTokens?.usdt],
			[baseTokens?.dai, baseTokens?.comp],
			[baseTokens?.dai, baseTokens?.usdc],
			[baseTokens?.dai, baseTokens?.wbtc],
			[baseTokens?.dai, this.settings.network.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private get mainCurrenciesPairsForUSDC(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[baseTokens?.usdc, baseTokens?.usdt],
			[baseTokens?.usdc, baseTokens?.comp],
			[baseTokens?.usdc, baseTokens?.dai],
			[baseTokens?.usdc, baseTokens?.wbtc],
			[baseTokens?.usdc, this.settings.network.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private get mainCurrenciesPairsForWETH(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[this.settings.network.nativeWrappedTokenInfo, baseTokens?.usdt],
			[this.settings.network.nativeWrappedTokenInfo, baseTokens?.comp],
			[this.settings.network.nativeWrappedTokenInfo, baseTokens?.dai],
			[this.settings.network.nativeWrappedTokenInfo, baseTokens?.usdc],
			[this.settings.network.nativeWrappedTokenInfo, baseTokens?.wbtc],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private get mainCurrenciesPairsForWBTC(): Token[][] {
		const { baseTokens } = this.settings.network;
		const pairs: (Token | undefined)[][] = [
			[baseTokens?.wbtc, baseTokens?.usdt],
			[baseTokens?.wbtc, baseTokens?.dai],
			[baseTokens?.wbtc, baseTokens?.usdc],
			[baseTokens?.wbtc, this.settings.network.nativeWrappedTokenInfo],
		];
		return this.filterUndefinedTokens(pairs);
	}

	private filterUndefinedTokens(tokens: (Token | undefined)[][]): Token[][] {
		return tokens.filter((t) => t[0] !== undefined && t[1] !== undefined) as Token[][];
	}

	public async trade(amount: bigint, direction: TradeDirection = TradeDirection.input): Promise<number> {
		this.executeTradePath(amount, direction);
		return 1;
	}

	private async executeTradePath(amount: bigint, direction: TradeDirection): Promise<number> {
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
		return getTradePath(getAddress(this.fromToken.contractAddress), getAddress(this.toToken.contractAddress), this.nativeWrappedAddress);
	}

	private async findBestPriceAndPathErc20ToEth(amount: bigint, direction: TradeDirection): Promise<void> {
		const bestRoute = await this.router.findBestRoute(amount, direction, TradePath.erc20ToEth);

		return;
	}

	private async findBestPriceAndPathEthToErc20(amount: bigint, direction: TradeDirection): Promise<void> {
		const bestRoute = await this.router.findBestRoute(amount, direction, TradePath.ethToErc20);

		return;
	}

	private async findBestPriceAndPathErc20ToErc20(amount: bigint, direction: TradeDirection): Promise<void> {
		const bestRoute = await this.router.findBestRoute(amount, direction, TradePath.erc20ToErc20);

		return;
	}
}
