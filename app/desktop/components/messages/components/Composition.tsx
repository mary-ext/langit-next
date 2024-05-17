import { createMemo, createSignal } from 'solid-js';
import TextareaAutosize from 'solid-textarea-autosize';

import { getRtLength, parseRt } from '~/api/richtext/composer';
import type { SignalizedConvo } from '~/api/stores/convo';

import type { Channel } from '~/desktop/lib/messages/channel';

import SendOutlinedIcon from '~/com/icons/outline-send';
import { IconButton } from '~/com/primitives/icon-button';

export interface CompositionProps {
	/** Expected to be static */
	convo: SignalizedConvo;
	/** Expected to be static */
	channel: Channel;
}

const MAX_MESSAGE_LIMIT = 1000;
const SHOW_LIMIT_COUNTER = MAX_MESSAGE_LIMIT - 200;

const Composition = (props: CompositionProps) => {
	// const [focused, setFocused] = createSignal(false);
	// const [userExpanded, setUserExpanded] = createSignal(false);

	const channel = props.channel;

	const [text, setText] = createSignal('');

	const rt = createMemo(() => parseRt(text()));
	const length = createMemo(() => getRtLength(rt()));

	return (
		<div class="px-3 pb-4">
			<div class="relative flex items-start gap-2 rounded-md bg-secondary/30 pl-3 pr-1">
				{/* {!focused() || text().length === 0 ? (
					<div class="flex">
						<button
							ref={(node) => {
								onMount(() => {
									if (userExpanded()) {
										node.focus();
										setUserExpanded(false);
									}
								});
							}}
							class={IconButton({ color: 'muted' })}
						>
							<ImageOutlinedIcon />
						</button>
						<button class={IconButton({ color: 'muted' })}>
							<GifBoxOutlinedIcon />
						</button>
						<button class={IconButton({ color: 'muted' })}>
							<EmojiEmotionsOutlinedIcon />
						</button>
					</div>
				) : (
					<div>
						<button
							onClick={() => {
								batch(() => {
									setFocused(false);
									setUserExpanded(true);
								});
							}}
							class={IconButton({ color: 'muted' })}
						>
							<ChevronRightIcon class="rotate-180" />
						</button>
					</div>
				)} */}

				<TextareaAutosize
					value={text()}
					onInput={(ev) => {
						// setFocused(true);
						setText(ev.target.value);
					}}
					onKeyDown={(ev) => {
						if (ev.key === 'Enter' && !ev.shiftKey) {
							ev.preventDefault();

							if (length() !== 0) {
								channel.sendMessage({ richtext: rt() });
								setText('');
							}
						}
					}}
					placeholder="Start a new message"
					minRows={1}
					maxRows={6}
					maxLength={MAX_MESSAGE_LIMIT * 1.5}
					class="grow resize-none self-stretch bg-transparent py-2.5 text-sm text-primary outline-none placeholder:text-muted-fg"
				/>

				<div class="flex h-10 items-center">
					<button
						disabled={(() => {
							const $length = length();
							return $length === 0 || $length > MAX_MESSAGE_LIMIT;
						})()}
						class={/* @once */ IconButton({ color: 'muted' })}
					>
						<SendOutlinedIcon />
					</button>
				</div>

				{length() >= SHOW_LIMIT_COUNTER && (
					<div
						class={
							`absolute bottom-0 right-0 select-none px-3 py-2.5 text-de` +
							(length() > MAX_MESSAGE_LIMIT ? ` text-red-600` : ` text-muted-fg`)
						}
					>
						{MAX_MESSAGE_LIMIT - length()}
					</div>
				)}
			</div>
		</div>
	);
};

export default Composition;
