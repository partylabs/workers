export function isIPFS(uri: string) {
	return !!getCID(uri);
}

export function getIPFSUrl(uri: string, gateway: string) {
	if (getCID(uri)) {
		return convertToDesiredGateway(uri, gateway);
	}
	return uri;
}

export function getPrivateGateway(chainName: string, tokenAddress: string) {
	if (isAddressMatch(chainName, tokenAddress, MAKERSPLACE_TOKEN_ADDRESS)) {
		return 'https://ipfsgateway.makersplace.com';
	}
	if (isAddressMatch(chainName, tokenAddress, FOUNDATION_TOKEN_ADDRESS)) {
		return 'https://ipfs.foundation.app';
	}
	if (isAddressMatch(chainName, tokenAddress, ZORA_TOKEN_ADDRESS)) {
		return 'https://zora-prod.mypinata.cloud';
	}
	return;
}
