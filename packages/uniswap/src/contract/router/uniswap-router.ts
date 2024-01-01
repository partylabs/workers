import { formatEther, formatUnits, getAddress, isAddressEqual, parseEther, toHex } from 'viem';
import { TradePath } from '../../models/trade-path';
import { TradeDirection } from '../factory/pair/models/trade-direction';
import { Token } from '../../models/token';
import { UniswapPairSettings } from '../factory/pair/models/uniswap-pair-settings';
import { UniswapVersion } from '../../models/uniswap-version';
import { Call } from '../../models/call';
import { FeeAmount } from './v3/enums/fee-amount-v3';

export class UniswapRouter {
	private fromToken: Token;
	private toToken: Token;
	private settings: UniswapPairSettings;

	constructor(fromToken: Token, toToken: Token, settings: UniswapPairSettings) {
		this.fromToken = fromToken;
		this.toToken = toToken;
		this.settings = settings;
	}

	public async findBestRoute(amount: bigint, direction: TradeDirection = TradeDirection.input, path: TradePath) {
		let allRoutes = await this.getAllPossibleRoutesWithQuotes(amount, direction, path);

		if (allRoutes.length === 0) {
			console.log('No routes found.');
			return;
		}
		return;
	}

	public async getAllPossibleRoutesWithQuotes(
		amount: bigint,
		direction: TradeDirection = TradeDirection.input,
		path: TradePath
	): Promise<string[]> {
		const tradeAmount = this.formatAmountToTrade(amount, direction, path);

		const routes = await this.getAllPossibleRoutes();

		// if has Uniswap V2

		// if has Uniswap V3
		return [];
	}

	public async formatAmountToTrade(amount: bigint, direction: TradeDirection = TradeDirection.input, path: TradePath): Promise<string> {
		switch (path) {
			case TradePath.ethToErc20:
				switch (direction) {
					case TradeDirection.input:
						return toHex(formatEther(amount));
					case TradeDirection.output:
						return toHex(formatUnits(amount, this.toToken.decimals));
				}
			case TradePath.erc20ToEth:
				switch (direction) {
					case TradeDirection.input:
						return toHex(formatUnits(amount, this.fromToken.decimals));
					case TradeDirection.output:
						return toHex(formatEther(amount));
				}
			case TradePath.erc20ToErc20:
				switch (direction) {
					case TradeDirection.input:
						return toHex(formatUnits(amount, this.fromToken.decimals));
					case TradeDirection.output:
						return toHex(formatUnits(amount, this.toToken.decimals));
				}
		}
	}

	public async getAllPossibleRoutes() {
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

		const v2Calls: ReferenceCall[] = [];
		const v3Calls: ReferenceCall[] = [];

		if (this.settings.uniswapVersions.includes(UniswapVersion.v2)) {
			for (let pairs = 0; pairs < findPairs.length; pairs++) {
				for (let tokenPairs = 0; tokenPairs < findPairs[pairs].length; tokenPairs++) {
					const fromToken = findPairs[pairs][tokenPairs][0];
					const toToken = findPairs[pairs][tokenPairs][1];
					if (isAddressEqual(fromToken.contractAddress, toToken.contractAddress)) continue;

					v2Calls.push({
						reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}`,
						methodName: 'getPair',
						methodParameters: [fromToken.contractAddress, toToken.contractAddress],
					});
				}
			}
		}

		if (this.settings.uniswapVersions.includes(UniswapVersion.v3)) {
			for (let pairs = 0; pairs < findPairs.length; pairs++) {
				for (let tokenPairs = 0; tokenPairs < findPairs[pairs].length; tokenPairs++) {
					const fromToken = findPairs[pairs][tokenPairs][0];
					const toToken = findPairs[pairs][tokenPairs][1];

					if (isAddressEqual(fromToken.contractAddress, toToken.contractAddress)) continue;

					for (let fee = 0; fee < 3; fee++) {
						const feeAmount = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH][fee];
						v3Calls.push({
							reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-${feeAmount}`,
							methodName: 'getPool',
							methodParameters: [fromToken.contractAddress, toToken.contractAddress, feeAmount],
						});
					}
				}
			}
		}

		return;
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
}
