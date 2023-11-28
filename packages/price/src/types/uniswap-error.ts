import { ErrorCodes } from './error-codes';

export class UniswapError extends Error {
	public name = 'UniswapError';
	public code: ErrorCodes;
	public message: string;
	constructor(message: string, code: ErrorCodes) {
		super(message);
		this.message = message;
		this.code = code;
	}
}
