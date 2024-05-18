import { createResource, onCleanup, Show, type ResourceOptions } from 'solid-js';

import { getCachedConvo, mergeConvo, SignalizedConvo } from '~/api/stores/convo';

import ChannelHeader from '../components/ChannelHeader';
import ChannelMessages from '../components/ChannelMessages';
import Composition from '../components/Composition';
import FirehoseIndicator from '../components/FirehoseStatus';

import { ChannelContext } from '../contexts/channel';
import { useChatPane } from '../contexts/chat';
import type { ViewKind, ViewParams } from '../contexts/router';

const ChannelView = ({ id }: ViewParams<ViewKind.CHANNEL>) => {
	const { did, firehose, channels, rpc } = useChatPane();

	const getInitialConvo = (): ResourceOptions<SignalizedConvo> => {
		const convo = getCachedConvo(did, id);
		return convo ? { initialValue: convo } : {};
	};

	const [convo] = createResource(async () => {
		const { data } = await rpc.get('chat.bsky.convo.getConvo', { params: { convoId: id } });
		return mergeConvo(did, data.convo);
	}, getInitialConvo());

	return (
		<Show when={convo.latest} keyed>
			{(convo) => {
				const channel = channels.get(convo.id);
				onCleanup(firehose.requestPollInterval(3_000));

				return (
					<ChannelContext.Provider value={{ convo, channel }}>
						<ChannelHeader />
						<FirehoseIndicator />
						<div class="flex min-h-0 shrink grow flex-col-reverse">
							<Composition />
							<ChannelMessages />
						</div>
					</ChannelContext.Provider>
				);
			}}
		</Show>
	);
};

export default ChannelView;
