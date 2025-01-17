import {
	type DataTag,
	type DefaultError,
	type QueryClient,
	type QueryKey,
	QueryObserver,
} from '@tanstack/query-core';

import { createBaseQuery } from './createBaseQuery.ts';
import type {
	CreateQueryOptions,
	CreateQueryResult,
	DefinedCreateQueryResult,
	QueryAccessor,
	SolidQueryOptions,
} from './types.ts';

type UndefinedInitialDataOptions<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
	initialData?: undefined;
};

type DefinedInitialDataOptions<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
	initialData: TQueryFnData | (() => TQueryFnData);
};

export function queryOptions<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
	queryKey: DataTag<TQueryKey, TQueryFnData>;
};
export function queryOptions<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
	queryKey: DataTag<TQueryKey, TQueryFnData>;
};
export function queryOptions(options: unknown) {
	return options;
}

export function createQuery<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: QueryAccessor<UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>>,
	queryClient?: QueryClient,
): CreateQueryResult<TData, TError>;

export function createQuery<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: QueryAccessor<DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>>,
	queryClient?: QueryClient,
): DefinedCreateQueryResult<TData, TError>;
export function createQuery<
	TQueryFnData,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(options: CreateQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient) {
	return createBaseQuery(options, QueryObserver, queryClient);
}
