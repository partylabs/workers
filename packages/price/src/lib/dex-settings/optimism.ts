import { ChainId, UniswapPairSettings } from "simple-uniswap-sdk";
import { mainnet, optimism } from "viem/chains";

export const uniswapOptimism = new UniswapPairSettings({
  customNetwork: {
    nameNetwork: optimism.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: optimism.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: mainnet.id as ChainId,
      contractAddress: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      symbol: "WETH",
      name: "Wrapped Ether",
    },
    baseTokens: {
      usdc: {
        chainId: optimism.id as ChainId,
        contractAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
      },
    },
  },
});
