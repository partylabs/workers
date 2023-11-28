import { ChainId, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { polygon } from "viem/chains";

export const quickswap = new UniswapPairSettings({
  cloneUniswapContractDetails: {
    v2Override: {
      routerAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
      factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
      pairAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    },
    v3Override: {
      routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      quoterAddress: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
  },
  customNetwork: {
    nameNetwork: polygon.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: polygon.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: polygon.id as ChainId,
      contractAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
      symbol: "WMATIC",
      name: "Wrapped Matic",
    },
    baseTokens: {
      usdc: {
        chainId: polygon.id as ChainId,
        contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
      },
    },
  },
});
