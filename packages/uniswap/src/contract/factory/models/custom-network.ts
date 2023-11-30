import { Token } from '../../../models/token';
import { NativeCurrencyInfo } from './native-currency-info';

export interface CustomNetwork {
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
