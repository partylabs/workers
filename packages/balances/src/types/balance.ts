export type Balance = {
  name: string;
  timestamp: number;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  keywords: string[];
  tokens: {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }[];
  tokenMap: {
    [key: string]: {
      chainId: number;
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      logoURI: string;
    };
  };
};
