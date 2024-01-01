import { formatEther, formatUnits, getAddress, isAddressEqual, parseEther, toHex } from 'viem';
import { TradePath } from '../../models/trade-path';
import { TradeDirection } from '../factory/pair/models/trade-direction';
import { Token } from '../../models/token';
import { UniswapPairSettings } from '../factory/pair/models/uniswap-pair-settings';
import { UniswapVersion } from '../../models/uniswap-version';
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

		// const routes = await this.getAllPossibleRoutes();

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
}
