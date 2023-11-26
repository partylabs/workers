import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from 'viem/chains';

export const CHAINS = {
	[mainnet.id]: mainnet,
	[optimism.id]: optimism,
	[bsc.id]: bsc,
	[polygon.id]: polygon,
	[pulsechain.id]: pulsechain,
	[base.id]: base,
	[arbitrum.id]: arbitrum,
	[avalanche.id]: avalanche,
};
