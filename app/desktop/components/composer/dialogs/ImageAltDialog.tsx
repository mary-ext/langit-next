import { createMemo, createSignal } from 'solid-js';
import TextareaAutosize from 'solid-textarea-autosize';

import { EOF_WS_RE } from '~/api/richtext/composer';
import { graphemeLen } from '~/api/richtext/intl';

import { closeModal } from '~/com/globals/modals';

import type { ComposedImage } from '~/utils/image';
import { formatLong } from '~/utils/intl/number';

import { Button } from '~/com/primitives/button';
import { DialogBody, DialogHeader, DialogRoot, DialogTitle } from '~/com/primitives/dialog';
import { IconButton } from '~/com/primitives/icon-button';
import { Textarea } from '~/com/primitives/textarea';

import { getBlobSrc } from '~/com/components/BlobImage';
import DialogOverlay from '~/com/components/dialogs/DialogOverlay';

import CloseIcon from '~/com/icons/baseline-close';

export interface ImageAltDialogProps {
	/** Expected to be static */
	image: ComposedImage;
}

const MAX_ALT_LENGTH = 5000;

const ImageAltDialog = (props: ImageAltDialogProps) => {
	const image = props.image;

	const [text, setText] = createSignal(image.alt.value);
	const actualText = createMemo(() => text().replace(EOF_WS_RE, ''));

	const length = createMemo(() => {
		return graphemeLen(actualText());
	});

	return (
		<DialogOverlay>
			<div class={/* @once */ DialogRoot({ size: 'md', fullHeight: true })}>
				<div class={/* @once */ DialogHeader({ divider: true })}>
					<button
						title="Close dialog"
						type="button"
						onClick={closeModal}
						class={/* @once */ IconButton({ edge: 'left' })}
					>
						<CloseIcon />
					</button>

					<h1 class={/* @once */ DialogTitle()}>Edit image description</h1>

					<button
						disabled={length() > MAX_ALT_LENGTH}
						onClick={() => {
							closeModal();
							image.alt.value = actualText();
						}}
						class={/* @once */ Button({ variant: 'primary', size: 'xs' })}
					>
						Save
					</button>
				</div>

				<div class={/* @once */ DialogBody({ class: 'flex flex-col', padded: false })}>
					<div class="grow bg-secondary/10 p-4">
						<div
							class="h-full w-full"
							style={`background: url(${getBlobSrc(image.blob)}) center/contain no-repeat`}
						></div>
					</div>

					<label class="block shrink-0 p-4">
						<span class="mb-2 flex items-center justify-between gap-2 text-sm font-medium leading-6 text-primary">
							<span>Description</span>
							<span
								class={
									'text-xs' +
									(length() > MAX_ALT_LENGTH ? ' font-bold text-red-500' : ' font-normal text-muted-fg')
								}
							>
								{formatLong(length())}/{/* @once */ formatLong(MAX_ALT_LENGTH)}
							</span>
						</span>

						<TextareaAutosize
							value={text()}
							onInput={(ev) => setText(ev.target.value)}
							autofocus
							minRows={2}
							maxRows={6}
							class={/* @once */ Textarea({ class: 'mb-2' })}
						/>
					</label>
				</div>
			</div>
		</DialogOverlay>
	);
};

export default ImageAltDialog;
