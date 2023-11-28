import { ChainId, UniswapPairSettings } from 'simple-uniswap-sdk';
import { mainnet } from 'viem/chains';

export const uniswapEthereum = new UniswapPairSettings({
	customNetwork: {
		nameNetwork: mainnet.name,
		multicallContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
		nativeCurrency: mainnet.nativeCurrency,
		nativeWrappedTokenInfo: {
			chainId: mainnet.id as ChainId,
			contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			decimals: 18,
			symbol: 'WETH',
			name: 'Wrapped Ether',
		},
		baseTokens: {
			usdc: {
				chainId: mainnet.id as ChainId,
				contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
				decimals: 6,
				symbol: 'USDC',
				name: 'USD Coin',
			},
		},
	},
});
