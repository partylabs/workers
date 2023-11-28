import { ChainId, UniswapPairSettings } from "simple-uniswap-sdk";
import { mainnet, base } from "viem/chains";

export const baseSwap = new UniswapPairSettings({
  cloneUniswapContractDetails: {
    v2Override: {
      routerAddress: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
      factoryAddress: "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB",
      pairAddress: "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB",
    },
    v3Override: {
      routerAddress: "0x1B8eea9315bE495187D873DA7773a874545D9D48",
      factoryAddress: "0x38015D05f4fEC8AFe15D7cc0386a126574e8077B",
      quoterAddress: "0xDe151D5c92BfAA288Db4B67c21CD55d5826bCc93",
    },
  },
  customNetwork: {
    nameNetwork: base.name,
    multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    nativeCurrency: base.nativeCurrency,
    nativeWrappedTokenInfo: {
      chainId: mainnet.id as ChainId,
      contractAddress: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      symbol: "WETH",
      name: "Wrapped Ether",
    },
    baseTokens: {
      usdc: {
        chainId: base.id as ChainId,
        contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
      },
    },
  },
});
