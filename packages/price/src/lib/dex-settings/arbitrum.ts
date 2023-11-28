import { UniswapPairSettings } from '../../types/uniswap-pair-settings';
import { arbitrum, mainnet } from 'viem/chains';

export const uniswapArbitrum = new UniswapPairSettings({
	customNetwork: {
		nameNetwork: arbitrum.name,
		multicallContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
		nativeCurrency: arbitrum.nativeCurrency,
		nativeWrappedTokenInfo: {
			chainId: mainnet.id,
			contractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
			decimals: 18,
			symbol: 'WETH',
			name: 'Wrapped Ether',
		},
		baseTokens: {
			usdc: {
				chainId: arbitrum.id,
				contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
				decimals: 6,
				symbol: 'USDC',
				name: 'USD Coin',
			},
		},
	},
});
