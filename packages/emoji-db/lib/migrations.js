import {
	FIELD_GROUP,
	FIELD_ORDER,
	FIELD_SKIN_UNICODE,
	FIELD_TOKENS,
	FIELD_UNICODE,
	INDEX_GROUP_AND_ORDER,
	INDEX_SKIN_UNICODE,
	INDEX_TOKENS,
	STORE_EMOJI,
	STORE_KEYVALUE,
} from './constants.js';

const initialMigration = (db) => {
	const createObjectStore = (name, keyPath, indexes) => {
		const store = keyPath ? db.createObjectStore(name, { keyPath }) : db.createObjectStore(name);
		if (indexes) {
			for (const [indexName, [keyPath, multiEntry]] of Object.entries(indexes)) {
				store.createIndex(indexName, keyPath, { multiEntry });
			}
		}
		return store;
	};

	createObjectStore(STORE_KEYVALUE);
	createObjectStore(STORE_EMOJI, /* keyPath */ FIELD_UNICODE, {
		[INDEX_TOKENS]: [FIELD_TOKENS, /* multiEntry */ true],
		[INDEX_GROUP_AND_ORDER]: [[FIELD_GROUP, FIELD_ORDER]],
		[INDEX_SKIN_UNICODE]: [FIELD_SKIN_UNICODE, /* multiEntry */ true],
	});
};

export { initialMigration };
