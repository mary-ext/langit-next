import { lazy, type JSX } from 'solid-js';

import type { SignalizedConvo } from '~/api/stores/convo';

import { openModal } from '~/com/globals/modals';

import { Flyout } from '~/com/components/Flyout';
import DoorOpenOutlinedIcon from '~/com/icons/outline-door-open';
import VolumeOffOutlinedIcon from '~/com/icons/outline-volume-off';
import VolumeUpOutlinedIcon from '~/com/icons/outline-volume-up';
import { MenuItem, MenuItemIcon, MenuRoot } from '~/com/primitives/menu';

import { useChatPane } from '../contexts/chat';

const ConfirmDialog = lazy(() => import('~/com/components/dialogs/ConfirmDialog'));

export interface ChannelOverflowAction {
	/** Expected to be static */
	convo: SignalizedConvo;
	onDeleteConfirm?: () => void;
	children: JSX.Element;
}

const ChannelOverflowAction = (props: ChannelOverflowAction) => {
	const { firehose, rpc, channels } = useChatPane();

	const convo = props.convo;
	const onDeleteConfirm = props.onDeleteConfirm;

	const isMuted = () => convo.muted.value;

	return (
		<Flyout button={props.children} placement="bottom-end">
			{({ close, menuProps }) => (
				<div {...menuProps} class={/* @once */ MenuRoot()}>
					<button
						onClick={async () => {
							close();

							if (!isMuted()) {
								await rpc.call('chat.bsky.convo.muteConvo', {
									data: {
										convoId: convo.id,
									},
								});

								convo.muted.value = true;
							} else {
								await rpc.call('chat.bsky.convo.unmuteConvo', {
									data: {
										convoId: convo.id,
									},
								});

								convo.muted.value = false;
							}
						}}
						class={/* @once */ MenuItem()}
					>
						{(() => {
							const Icon = !isMuted() ? VolumeOffOutlinedIcon : VolumeUpOutlinedIcon;
							return <Icon class={/* @once */ MenuItemIcon()} />;
						})()}
						<span>{!isMuted() ? `Mute conversation` : `Unmute conversation`}</span>
					</button>

					<hr class="mx-2 my-1 border-divider" />

					<button
						onClick={() => {
							close();

							openModal(() => (
								<ConfirmDialog
									title="Leave this conversation?"
									body="All messages will be deleted for you, but not to other participants."
									confirmation="Leave"
									onConfirm={async () => {
										onDeleteConfirm?.();

										await rpc.call('chat.bsky.convo.leaveConvo', {
											data: {
												convoId: convo.id,
											},
										});

										firehose.poll();

										// @todo: should be fine to destroy here?
										channels.delete(convo.id);
									}}
								/>
							));
						}}
						class={/* @once */ MenuItem()}
					>
						<DoorOpenOutlinedIcon class={/* @once */ MenuItemIcon()} />
						<span>Leave this conversation</span>
					</button>
				</div>
			)}
		</Flyout>
	);
};

export default ChannelOverflowAction;