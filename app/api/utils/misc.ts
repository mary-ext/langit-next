import { XRPCError, type Headers } from '@mary/bluesky-client/xrpc';

import type { At } from '../atp-schema';
import { MultiagentError } from '../classes/multiagent';

export const isDid = (value: string): value is At.DID => {
	return value.startsWith('did:');
};

export const getRecordId = (uri: string) => {
	const idx = uri.lastIndexOf('/');
	return uri.slice(idx + 1);
};

export const getCollectionId = (uri: string) => {
	const first = uri.indexOf('/', 5);
	const second = uri.indexOf('/', first + 1);

	return uri.slice(first + 1, second);
};

export const getRepoId = (uri: string) => {
	const idx = uri.indexOf('/', 5);
	return uri.slice(5, idx);
};

export const getCurrentDate = () => {
	const date = new Date();
	date.setMilliseconds(0);

	return date.toISOString();
};

export const followAbortSignal = (signals: (AbortSignal | undefined)[]) => {
	const controller = new AbortController();
	const own = controller.signal;

	for (let idx = 0, len = signals.length; idx < len; idx++) {
		const signal = signals[idx];

		if (!signal) {
			continue;
		}

		if (signal.aborted) {
			controller.abort(signal.reason);
			break;
		}

		signal.addEventListener('abort', () => controller.abort(signal.reason), { signal: own });
	}

	return own;
};

export const formatXRPCError = (err: XRPCError): string => {
	const name = err.kind;
	return (name ? name + ': ' : '') + err.message;
};

export const formatQueryError = (err: unknown): string => {
	if (err instanceof MultiagentError) {
		const msg = err.message;
		const cause = err.cause;

		if (msg === 'INVALID_ACCOUNT') {
			return `Associated account was removed, sign in again or switch to another account`;
		}

		if (cause) {
			err = cause;
		}
	}

	if (err instanceof XRPCError) {
		const error = err.kind;

		if (error === 'InvalidToken' || error === 'ExpiredToken') {
			return `Account session is no longer valid, please sign in again`;
		}

		return formatXRPCError(err);
	}

	return '' + err;
};

export const waitForRatelimit = async (headers: Headers, expected: number) => {
	if ('ratelimit-remaining' in headers) {
		const remaining = +headers['ratelimit-remaining'];
		const reset = +headers['ratelimit-reset'] * 1_000;

		if (remaining <= expected) {
			// Add some delay to be sure
			const delta = reset - Date.now() + 5_000;
			await new Promise((resolve) => setTimeout(resolve, delta));
		}
	}
};
