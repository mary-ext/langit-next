import { createInfiniteQuery } from '@mary/solid-query';

import type { At } from '~/api/atp-schema';

import { getPostReposts, getPostRepostsKey } from '~/api/queries/get-post-reposts';

import { getModerationOptions } from '~/com/globals/shared';

import ProfileList from '~/com/components/lists/ProfileList';
import { LINK_PROFILE, useLinking } from '~/com/components/Link';

import { usePaneContext } from '../PaneContext';
import PaneDialog from '../PaneDialog';
import PaneDialogHeader from '../PaneDialogHeader';

export interface PostRepostedByDialogProps {
	/** Expected to be static */
	actor: At.DID;
	/** Expected to be static */
	rkey: string;
}

const PostRepostedByPaneDialog = (props: PostRepostedByDialogProps) => {
	const { actor, rkey } = props;

	const linking = useLinking();
	const { pane } = usePaneContext();

	const uri = `at://${actor}/app.bsky.feed.post/${rkey}`;

	const reposts = createInfiniteQuery(() => {
		return {
			queryKey: getPostRepostsKey(pane.uid, uri),
			queryFn: getPostReposts,
			initialPageParam: undefined,
			getNextPageParam: (last) => last.cursor,
			meta: {
				moderation: getModerationOptions(),
			},
		};
	});

	return (
		<PaneDialog>
			<PaneDialogHeader title={`Reposts`} />

			<div class="flex min-h-0 grow flex-col overflow-y-auto">
				<ProfileList
					query={reposts}
					onItemClick={(profile, alt) => {
						if (alt) {
							return;
						}

						linking.navigate({ type: LINK_PROFILE, actor: profile.did });
					}}
				/>
			</div>
		</PaneDialog>
	);
};

export default PostRepostedByPaneDialog;
