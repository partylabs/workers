import { ChainId, UniswapPairSettings } from "simple-uniswap-sdk";
import { bsc } from "viem/chains";

export const pancakeSwap = new UniswapPairSettings({
  cloneUniswapContractDetails: {
    v2Override: {
      routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
      pairAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    },
    v3Override: {
      routerAddress: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
      factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
      quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
    },
  },
  customNetwork: {
    nameNetwork: bsc.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: bsc.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: bsc.id as ChainId,
      contractAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      symbol: "WBNB",
      name: "Wrapped WBNB",
    },
    baseTokens: {
      usdc: {
        chainId: bsc.id as ChainId,
        contractAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        decimals: 18,
        symbol: "USDC",
        name: "USD Coin",
      },
    },
  },
});
