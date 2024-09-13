import type { At } from '@atcute/client/lexicons';
import type { QueryFunctionContext as QC } from '@mary/solid-query';

import { multiagent } from '../globals/agent';
import { moderateProfileList } from '../moderation/utils';
import { getCachedProfile, mergeProfile } from '../stores/profiles';

export const getProfileKnownFollowersKey = (uid: At.DID, actor: string, limit = 25) => {
	return ['getProfileKnownFollowers', uid, actor, limit] as const;
};
export const getProfileKnownFollowers = async (
	ctx: QC<ReturnType<typeof getProfileKnownFollowersKey>, string | undefined>,
) => {
	const [, uid, actor, limit] = ctx.queryKey;

	const agent = await multiagent.connect(uid);

	const response = await agent.rpc.get('app.bsky.graph.getKnownFollowers', {
		signal: ctx.signal,
		params: {
			actor: actor,
			limit: limit,
			cursor: ctx.pageParam,
		},
	});

	const data = response.data;

	return {
		cursor: data.cursor,
		subject: mergeProfile(uid, data.subject),
		profiles: moderateProfileList(
			data.followers.map((actor) => mergeProfile(uid, actor)),
			ctx.meta?.moderation,
		),
	};
};

export const getInitialProfileKnownFollowers = (key: ReturnType<typeof getProfileKnownFollowersKey>) => {
	const [, uid, actor] = key;

	const profile = getCachedProfile(uid, actor as At.DID);

	if (profile) {
		return {
			pages: [
				{
					cursor: undefined,
					subject: profile,
					profiles: [],
				},
			],
			pageParams: [undefined],
		};
	}
};