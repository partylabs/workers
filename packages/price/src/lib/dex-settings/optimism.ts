import { UniswapPairSettings } from '../../types/uniswap-pair-settings';
import { mainnet, optimism } from 'viem/chains';

export const uniswapOptimism = new UniswapPairSettings({
	cloneUniswapContractDetails: {
		v2Override: {
			routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
			factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
			pairAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
		},
		v3Override: {
			routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
			factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
			quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
		},
	},
	customNetwork: {
		nameNetwork: optimism.name,
		multicallContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
		nativeCurrency: optimism.nativeCurrency,
		nativeWrappedTokenInfo: {
			chainId: mainnet.id,
			contractAddress: '0x4200000000000000000000000000000000000006',
			decimals: 18,
			symbol: 'WETH',
			name: 'Wrapped Ether',
		},
		baseTokens: {
			usdc: {
				chainId: optimism.id,
				contractAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
				decimals: 6,
				symbol: 'USDC',
				name: 'USD Coin',
			},
		},
	},
});
