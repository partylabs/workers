# Workers

## Create new package

```sh
cd packages
npm create cloudflare@latest
cd <package-name>
npm i viem
```

## Ports

| Protocol    | Port  |
| ----------- | ----- |
| ens         | 16000 |
| block       | 16001 |
| balance     | 16100 |
| uniswap     | 16300 |
| xen         | 16400 |
| fenix       | 16500 |
| hex         | 16600 |
| collectable | 16700 |

## Development Variables

1. Create a file called `.dev.vars`
2. Add it to the `packages/<project>` directory
3. Setup your development variables

```
RPC_URL_1=https://ethereum.publicnode.com
RPC_URL_10=https://optimism.llamarpc.com
RPC_URL_137=https://polygon.llamarpc.com
RPC_URL_250=https://fantom.publicnode.com
RPC_URL_324=https://mainnet.era.zksync.io
RPC_URL_369=https://rpc.pulsechain.com
RPC_URL_42161=https://arbitrum.llamarpc.com
RPC_URL_43114=https://avalanche-c-chain.publicnode.com
RPC_URL_56=https://binance.llamarpc.com
RPC_URL_8453=https://mainnet.base.org
```
