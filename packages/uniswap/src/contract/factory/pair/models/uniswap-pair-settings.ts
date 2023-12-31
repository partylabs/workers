import { UniswapVersion } from '../../../../models/uniswap-version';
import { CloneUniswapContractDetails } from './clone-uniswap-contract-details';
import { Network, mainnetNetwork } from '../../models/network';
import { UniswapError } from '../../../../models/uniswap-error';
import { ErrorCodes } from '../../../../models/error-codes';

export class UniswapPairSettings {
	network: Network;
	slippage: number;
	deadlineMinutes: number;
	disableMultihop: boolean;
	uniswapVersions: UniswapVersion[] = [UniswapVersion.v2, UniswapVersion.v3];
	gasSettings?: string = undefined;
	cloneUniswapContractDetails?: CloneUniswapContractDetails = undefined;

	constructor(settings?: {
		network: Network;
		slippage?: number | undefined;
		deadlineMinutes?: number | undefined;
		disableMultihop?: boolean | undefined;
		uniswapVersions?: UniswapVersion[] | undefined;
		gasSettings?: string | undefined;
		cloneUniswapContractDetails?: CloneUniswapContractDetails | undefined;
	}) {
		this.network = settings?.network || mainnetNetwork;
		this.slippage = settings?.slippage || 0.005;
		this.deadlineMinutes = settings?.deadlineMinutes || 20;
		this.disableMultihop = settings?.disableMultihop || false;
		this.gasSettings = settings?.gasSettings;
		this.cloneUniswapContractDetails = settings?.cloneUniswapContractDetails;

		if (Array.isArray(settings?.uniswapVersions) && settings?.uniswapVersions.length === 0) {
			throw new UniswapError('`uniswapVersions` must not be an empty array', ErrorCodes.uniswapVersionsMustNotBeAnEmptyArray);
		}

		if (settings && Array.isArray(settings.uniswapVersions) && settings.uniswapVersions.length > 0) {
			if (settings.uniswapVersions.find((u) => u !== UniswapVersion.v2 && u !== UniswapVersion.v3)) {
				throw new UniswapError('`uniswapVersions` only accepts v2 or v3', ErrorCodes.uniswapVersionsUnsupported);
			}

			this.uniswapVersions = settings?.uniswapVersions;
		}
	}
}
