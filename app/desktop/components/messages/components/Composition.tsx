import { createEffect, createMemo, createSignal } from 'solid-js';
import TextareaAutosize from 'solid-textarea-autosize';

import { getRtLength, parseRt } from '~/api/richtext/composer';

import { autofocusIf, refs } from '~/utils/input';

import { IconButton } from '~/com/primitives/icon-button';

import EmojiFlyout from '~/com/components/emojis/EmojiFlyout';

import EmojiEmotionsOutlinedIcon from '~/com/icons/outline-emoji-emotions';
import SendOutlinedIcon from '~/com/icons/outline-send';

import { useChannel } from '../contexts/channel';
import { useChatPane } from '../contexts/chat';

const MAX_MESSAGE_LIMIT = 1000;
const SHOW_LIMIT_COUNTER = MAX_MESSAGE_LIMIT - 200;

export interface CompositionProps {
	ref?: (node: HTMLTextAreaElement) => void;
}

const Composition = (props: CompositionProps) => {
	let ref: HTMLTextAreaElement;

	const { isOpen } = useChatPane();
	const { channel } = useChannel();

	// const [focused, setFocused] = createSignal(false);
	// const [userExpanded, setUserExpanded] = createSignal(false);

	const [text, setText] = createSignal('');

	const rt = createMemo(() => parseRt(text()));
	const length = createMemo(() => getRtLength(rt()));

	const sendMessage = () => {
		if (length() !== 0) {
			channel.sendMessage({ richtext: rt() });
			setText('');
		}

		ref.focus();
	};

	createEffect(() => {
		props.ref?.(ref);
	});

	return (
		<div class="px-3 pb-4">
			<div class="relative flex items-start gap-2 rounded-md bg-secondary/30 px-1">
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

				<div class="flex h-10 items-center">
					<EmojiFlyout
						multiple
						placement="top"
						onPick={(emoji, single) => {
							if (single) {
								setTimeout(() => {
									ref!.focus();
									document.execCommand('insertText', false, emoji.picked);
								}, 0);
							} else {
								// We can't use insertText here, this breaks undo/redo history
								ref!.setRangeText(emoji.picked);
								ref!.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
							}
						}}
					>
						<button class={IconButton({ color: 'muted' })}>
							<EmojiEmotionsOutlinedIcon />
						</button>
					</EmojiFlyout>
				</div>

				<TextareaAutosize
					ref={refs<HTMLTextAreaElement>((node) => (ref = node), autofocusIf(isOpen))}
					value={text()}
					onInput={(ev) => {
						// setFocused(true);
						setText(ev.target.value);
					}}
					onKeyDown={(ev) => {
						if (ev.key === 'Enter' && !ev.shiftKey) {
							ev.preventDefault();
							sendMessage();
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
						onClick={sendMessage}
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
