import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain, zkSync } from "viem/chains";

export const CHAINS = {
  [mainnet.id]: mainnet,
  [optimism.id]: optimism,
  [bsc.id]: bsc,
  [polygon.id]: polygon,
  // [zkSync.id]: zkSync,
  [pulsechain.id]: pulsechain,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [avalanche.id]: avalanche,
};
