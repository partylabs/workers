import { Abi } from 'abitype';
import { IRouterMethods } from './route-methods';

export interface CloneUniswapContractDetailsV2 {
	routerAddress: string;
	factoryAddress: string;
	pairAddress: string;
	routerAbi?: Abi;
	routerMethods?: Partial<IRouterMethods>;
}

export interface CloneUniswapContractDetailsV3 {
	routerAddress: string;
	factoryAddress: string;
	quoterAddress: string;
	routerAbi?: Abi;
}

export interface CloneUniswapContractDetails {
	v2Override?: CloneUniswapContractDetailsV2 | undefined;
	v3Override?: CloneUniswapContractDetailsV3 | undefined;
}
