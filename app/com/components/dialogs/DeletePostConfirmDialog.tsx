import { type InfiniteData, useQueryClient, createMutation } from '@mary/solid-query';

import { multiagent } from '~/api/globals/agent';
import { getRecordId } from '~/api/utils/misc';

import type { ThreadData } from '~/api/models/threads';
import { getPost, getPostKey } from '~/api/queries/get-post';
import type { getPostThreadKey } from '~/api/queries/get-post-thread';
import type { TimelinePage } from '~/api/queries/get-timeline';
import { type SignalizedPost, removeCachedPost } from '~/api/stores/posts';
import { producePostDelete } from '~/api/updaters/delete-post';

import { closeModal } from '~/com/globals/modals';

import ConfirmDialog from './ConfirmDialog';

export interface DeletePostConfirmDialogProps {
	/** Expected to be static */
	post: SignalizedPost;
}

const DeletePostConfirmDialog = (props: DeletePostConfirmDialogProps) => {
	const queryClient = useQueryClient();

	const deleteMutation = createMutation(() => {
		const post = props.post;

		const postUri = post.uri;
		const parentUri = post.record.value.reply?.parent.uri;
		const rootUri = post.record.value.reply?.root.uri;

		const did = post.uid;
		const handle = post.author.handle.value;
		const rkey = getRecordId(postUri);

		return {
			mutationFn: async () => {
				const agent = await multiagent.connect(did);

				await agent.rpc.call('com.atproto.repo.deleteRecord', {
					data: {
						repo: did,
						collection: 'app.bsky.feed.post',
						rkey: rkey,
					},
				});
			},
			onMutate: () => {
				closeModal();
			},
			onSuccess: () => {
				const [updateTimeline, updatePostThread] = producePostDelete(postUri);

				// 1. Remove our cached post
				removeCachedPost(did, postUri);

				// 2. Reset any post thread queries that directly shows the post
				queryClient.resetQueries({
					queryKey: ['getPostThread'],
					predicate: (query) => {
						const [, , actor, post] = query.queryKey as ReturnType<typeof getPostThreadKey>;
						return post === rkey && (actor === did || actor === handle);
					},
				});

				// 3. Reset post queries
				queryClient.resetQueries({
					queryKey: ['getPost'],
					predicate: (query) => {
						const [, , uri] = query.queryKey as ReturnType<typeof getPostKey>;
						return uri === postUri;
					},
				});

				// 4. Mutate all timeline and post thread queries
				queryClient.setQueriesData<InfiniteData<TimelinePage>>({ queryKey: ['getTimeline'] }, (data) => {
					if (data) {
						return updateTimeline(data);
					}

					return data;
				});

				queryClient.setQueriesData<ThreadData>({ queryKey: ['getPostThread'] }, (data) => {
					if (data) {
						const post = data.post;
						const root = post.record.value.reply?.root.uri;

						// Our posts can be in 3 different places here:
						// 1. the main URI is the root of our post.
						// 3. the root URI is the root of our post.
						if (post.uri === rootUri || (root && root === rootUri)) {
							return updatePostThread(data);
						}
					}

					return data;
				});

				// 5. Re-fetch the parent post to get an accurate view over the reply count
				if (parentUri) {
					queryClient.fetchQuery({
						queryKey: getPostKey(post.uid, parentUri),
						queryFn: getPost,
						staleTime: 0,
					});
				}
			},
		};
	});

	return (
		<ConfirmDialog
			title={`Delete post?`}
			body={`This can't be undone, the post will be removed from your profile, the timeline of any users that follows you, and from search results.`}
			confirmation={`Delete`}
			onConfirm={() => deleteMutation.mutate()}
		/>
	);
};

export default DeletePostConfirmDialog;
