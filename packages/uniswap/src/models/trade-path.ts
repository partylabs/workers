import { Token } from './token';
import { isAddressEqual, getAddress, Address } from 'viem';

export enum TradePath {
	ethToErc20 = 'ethToErc20',
	erc20ToEth = 'erc20ToEth',
	erc20ToErc20 = 'erc20ToErc20',
}

export function getTradePath(fromAddress: Address, toAddress: Address, nativeWrappedTokenContractAddress: string): TradePath {
	if (isAddressEqual(fromAddress, getAddress(nativeWrappedTokenContractAddress))) {
		return TradePath.ethToErc20;
	}

	if (isAddressEqual(toAddress, getAddress(nativeWrappedTokenContractAddress))) {
		return TradePath.erc20ToEth;
	}

	return TradePath.erc20ToErc20;
}
