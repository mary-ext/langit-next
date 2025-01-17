import * as fs from 'node:fs';

import { XRPC, simpleFetchHandler } from '@atcute/client';

const DID_LIST_URL = 'https://raw.githubusercontent.com/mary-ext/bluesky-labelers/trunk/README.md';
const SOURCE_PATH = 'api/queries/get-labeler-popular.ts';

let creators;

{
	console.log(`retrieving labeler listing`);
	const response = await fetch(DID_LIST_URL);

	if (!response.ok) {
		throw new Error(`got ${response.status}`);
	}

	const text = await response.text();
	const dids = Array.from(
		text.matchAll(/(?<=\/)did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-](?=>)/g),
		(m) => m[0],
	);

	const rpc = new XRPC({ handler: simpleFetchHandler({ service: 'https://api.bsky.app' }) });
	const chunks = await Promise.all(
		chunked(dids, 25).map((dids) => {
			return rpc
				.get('app.bsky.labeler.getServices', { params: { dids: dids } })
				.then((response) => response.data);
		}),
	);

	const collator = new Intl.Collator('en-US');
	const listing = chunks
		.flatMap((data) => data.views)
		.sort((a, b) => {
			return (
				(b.likeCount ?? 0) - (a.likeCount ?? 0) ||
				collator.compare(a.creator.displayName || a.creator.handle, b.creator.displayName || b.creator.handle)
			);
		});

	creators = listing.map((x) => x.creator);
}

{
	const substr = `[\n${creators.map((x) => `\t'${x.did}', // ${x.handle}\n`).join('')}]`;
	const re = /(?<=const dids(?::\s*[a-z[\]]+)?\s*=\s*)\[[^]*?\](?=;)/;

	const source = fs.readFileSync(SOURCE_PATH, 'utf-8');
	const rewritten = source.replace(re, substr);

	fs.writeFileSync(SOURCE_PATH, rewritten);
}

function chunked(arr, size) {
	const chunks = [];

	for (let i = 0, il = arr.length; i < il; i += size) {
		chunks.push(arr.slice(i, i + size));
	}

	return chunks;
}
