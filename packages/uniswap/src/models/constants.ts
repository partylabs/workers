import { Token } from './token';

export const USDT: Token = {
	chainId: 1,
	contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
	decimals: 6,
	symbol: 'USDT',
	name: 'Tether USD',
};

export const COMP: Token = {
	chainId: 1,
	contractAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
	decimals: 18,
	symbol: 'COMP',
	name: 'Compound',
};

export const DAI: Token = {
	chainId: 1,
	contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
	decimals: 18,
	symbol: 'DAI',
	name: 'Dai Stablecoin',
};

export const USDC: Token = {
	chainId: 1,
	contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	decimals: 6,
	symbol: 'USDC',
	name: 'USD Coin',
};

export const WETH: Token = {
	chainId: 1,
	contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	decimals: 18,
	symbol: 'WETH',
	name: 'Wrapped Ether',
};

export const WBTC: Token = {
	chainId: 1,
	contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	decimals: 8,
	symbol: 'WBTC',
	name: 'Wrapped BTC',
};
