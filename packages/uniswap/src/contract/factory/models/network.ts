import { COMP, DAI, USDC, USDT, WBTC, WETH } from '../../../models/constants';
import { Token } from '../../../models/token';
import { NativeCurrencyInfo } from './native-currency-info';

export interface Network {
	nameNetwork: string;
	multicallContractAddress: string;
	nativeCurrency: NativeCurrencyInfo;
	nativeWrappedTokenInfo: Token;
	// defined your base tokens here if any for your custom network!
	baseTokens?: {
		usdt?: Token | undefined;
		dai?: Token | undefined;
		comp?: Token | undefined;
		usdc?: Token | undefined;
		wbtc?: Token | undefined;
	};
}

export const mainnetNetwork: Network = {
	nameNetwork: 'Mainnet',
	multicallContractAddress: '',
	nativeCurrency: {
		name: 'Ether',
		symbol: 'ETH',
	},
	nativeWrappedTokenInfo: WETH,
	baseTokens: {
		usdt: USDT,
		dai: DAI,
		comp: COMP,
		usdc: USDC,
		wbtc: WBTC,
	},
};
