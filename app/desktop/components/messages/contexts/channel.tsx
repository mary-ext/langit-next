import { createContext, useContext } from 'solid-js';

import { assert } from '~/utils/misc';

import type { Channel } from '~/desktop/lib/messages/channel';
import type { SignalizedConvo } from '~/api/stores/convo';

export interface ChannelState {
	convo: SignalizedConvo;
	channel: Channel;
}

export const ChannelContext = createContext<ChannelState>();

export const useChannel = (): ChannelState => {
	const channel = useContext(ChannelContext);
	assert(channel !== undefined, `useChannel should be used inside <ChannelContext.Provider>`);

	return channel;
};
