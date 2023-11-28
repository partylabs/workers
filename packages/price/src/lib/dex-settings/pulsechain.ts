import { ChainId, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { pulsechain } from "viem/chains";

export const pulsex = new UniswapPairSettings({
  uniswapVersions: [UniswapVersion.v2],
  cloneUniswapContractDetails: {
    v2Override: {
      routerAddress: "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02",
      factoryAddress: "0x1715a3E4A142d8b698131108995174F37aEBA10D",
      pairAddress: "0x1715a3E4A142d8b698131108995174F37aEBA10D",
    },
  },
  customNetwork: {
    nameNetwork: pulsechain.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: pulsechain.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: pulsechain.id as ChainId,
      contractAddress: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
      decimals: 18,
      symbol: "WPLS",
      name: "Wrapped Pulse",
    },
    baseTokens: {
      dai: {
        chainId: pulsechain.id as ChainId,
        contractAddress: "0xefD766cCb38EaF1dfd701853BFCe31359239F305",
        decimals: 18,
        symbol: "DAI",
        name: "Dai Stablecoin from Ethereum",
      },
      usdt: {
        chainId: pulsechain.id as ChainId,
        contractAddress: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f",
        decimals: 6,
        symbol: "USDT",
        name: "Tether USD from Ethereum",
      },
      usdc: {
        chainId: pulsechain.id as ChainId,
        contractAddress: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin from Ethereum",
      },
    },
  },
});
