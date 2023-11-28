import { ChainId, UniswapPairSettings } from "simple-uniswap-sdk";
import { avalanche } from "viem/chains";

export const traderJoe = new UniswapPairSettings({
  cloneUniswapContractDetails: {
    v2Override: {
      routerAddress: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
      factoryAddress: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
      pairAddress: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    },
    v3Override: {
      routerAddress: "0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3",
      factoryAddress: "0x6E77932A92582f504FF6c4BdbCef7Da6c198aEEf",
      quoterAddress: "0x9Dbf1706577636941Ab5f443D2AEbE251ccd1648",
    },
  },
  customNetwork: {
    nameNetwork: avalanche.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: avalanche.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: avalanche.id as ChainId,
      contractAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      symbol: "WAVAX",
      name: "Wrapped AVAX",
    },
    baseTokens: {
      usdc: {
        chainId: avalanche.id as ChainId,
        contractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
      },
    },
  },
});
