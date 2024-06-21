# solid-query

A fork of `@tanstack/solid-query`

- Removes `createResource` usage, thereby removing any Suspense support.
- Removes `throwOnError` functionality, perhaps it'll come back later.
- Removes `reconcile` functionality, `structuralSharing` is preferred.
- Removes `isRestoring` functionality, I don't have any need for it.
- `createQueries` is turned into something like a reducer, which is what it's supposed to be anyway.
- Removes `createStore` usage, the nested reactivity shouldn't be affecting the actual query data, it's not really useful in practice, especially if the query data is replaced entirely.
- Set up `notifyManager` to make use of Solid.js' batching, and unset the scheduler so it works synchronously to match.
- Removes server-side support, these were mostly in the form of special configuration.
- Passes the query client into the accessor, removes the need for separate useQueryClient to retrieve it.
- General clean up around the codebase.
