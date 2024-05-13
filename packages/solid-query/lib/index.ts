import './notifyManager.ts';

// Re-export core
export * from '@tanstack/query-core';

// Solid Query
export { QueryClientContext, QueryClientProvider, useQueryClient } from './QueryClientProvider.tsx';
export type { QueryClientProviderProps } from './QueryClientProvider.tsx';
export { createInfiniteQuery } from './createInfiniteQuery.ts';
export { createMutation } from './createMutation.ts';
export { createQueries } from './createQueries.ts';
export { createQuery, queryOptions } from './createQuery.ts';
export * from './types.ts';
export { useIsFetching } from './useIsFetching.ts';
export { useIsMutating } from './useIsMutating.ts';
export { useMutationState } from './useMutationState.ts';
