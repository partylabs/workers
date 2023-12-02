import { Env } from '..';
import { createPublicClient, http, Abi, getAddress, formatEther } from 'viem';

export async function getStakes(
	publicKeys: string[],
	chainId: string,
	XEN_CRYPTO_ABI: Abi,
	XEN_CRYPTO_ADDRESS: string,
	env: Env
): Promise<any[]> {
	return [];
}
