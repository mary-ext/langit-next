import { type JSX, For, createSignal } from 'solid-js';

import { autoUpdate, offset } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';

import { graphemeLen } from '~/api/richtext/intl.ts';

import { assert } from '~/utils/misc.ts';

import { Interactive } from '~/com/primitives/interactive.ts';

import { offsetlessMiddlewares } from '~/com/components/Flyout.tsx';

import CloseIcon from '~/com/icons/baseline-close.tsx';
import PoundIcon from '~/com/icons/baseline-pound.tsx';

export interface TagsInputProps {
	tags: string[];
	limit?: number;
	onChange: (next: string[]) => void;
}

const enum MoveAction {
	LEFT,
	RIGHT,
	ANYWHERE,
}

const tagBtn = Interactive({
	offset: false,
	class: `group flex min-w-0 items-center gap-1 rounded-full bg-secondary/30 px-2 leading-6`,
});

const TagsInput = (props: TagsInputProps) => {
	const [focused, setFocused] = createSignal(false);

	const [reference, setReference] = createSignal<HTMLElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();

	const position = useFloating(reference, floating, {
		placement: 'top-start',
		middleware: [offset({ mainAxis: 8 }), ...offsetlessMiddlewares],
		whileElementsMounted: autoUpdate,
	});

	const onChange = props.onChange;

	const moveFocus = (target: HTMLElement, action: MoveAction) => {
		let sibling: HTMLButtonElement | HTMLInputElement | null;

		if (action === MoveAction.LEFT) {
			sibling = target.previousSibling as any;
		} else if (action === MoveAction.RIGHT) {
			sibling = target.nextSibling as any;
		} else if (action === MoveAction.ANYWHERE) {
			sibling = (target.previousSibling || target.nextSibling) as any;
		} else {
			assert(false);
		}

		if (sibling) {
			if (sibling instanceof HTMLInputElement && sibling.classList.contains('hidden')) {
				return;
			}

			sibling.focus();
			target.tabIndex = -1;
		}
	};

	return [
		() => {
			if (focused()) {
				return (
					<div
						ref={setFloating}
						class="rounded-md border border-divider px-2 py-1 text-de shadow-md shadow-background"
						style={{
							position: position.strategy,
							top: `${position.y ?? 0}px`,
							left: `${position.x ?? 0}px`,
						}}
					>
						Press Enter to save your tag
					</div>
				);
			}
		},

		<div ref={setReference} class="flex flex-wrap gap-1.5 text-sm">
			<For each={props.tags}>
				{(tag, index) => {
					let target: HTMLButtonElement;

					const removeSelf = () => {
						const clone = props.tags.slice();
						clone.splice(index(), 1);

						moveFocus(target, MoveAction.ANYWHERE);
						onChange(clone);
					};

					const handleFocus = () => {
						target.tabIndex = 0;
					};

					const handleKeydown = (ev: KeyboardEvent) => {
						const key = ev.key;

						if (key === 'ArrowLeft') {
							ev.preventDefault();
							moveFocus(target, MoveAction.LEFT);
						} else if (key === 'ArrowRight') {
							ev.preventDefault();
							moveFocus(target, MoveAction.RIGHT);
						} else if (key === 'Enter' || key === 'Backspace') {
							ev.preventDefault();
							removeSelf();
						}
					};

					return (
						<button
							ref={(node) => {
								target = node;
							}}
							tabIndex={-1}
							onFocus={handleFocus}
							onClick={removeSelf}
							onKeyDown={handleKeydown}
							class={tagBtn}
						>
							<PoundIcon class="group-hover:hidden group-focus-visible:hidden" />
							<CloseIcon class="hidden group-hover:block group-focus-visible:block" />

							<span tabIndex={-1} class="overflow-hidden text-ellipsis whitespace-nowrap">
								{tag}
							</span>
						</button>
					);
				}}
			</For>

			<input
				tabIndex={0}
				type="text"
				placeholder="#add tags"
				class="min-w-0 grow rounded-md bg-transparent leading-6 outline-2 outline-transparent outline placeholder:text-muted-fg"
				classList={{ [`hidden`]: props.limit !== undefined && props.tags.length >= props.limit }}
				onFocus={(ev) => {
					const target = ev.currentTarget;
					target.tabIndex = 0;

					setFocused(true);
				}}
				onBlur={() => {
					setFocused(false);
					setReference(undefined);
				}}
				onKeyDown={(ev) => {
					const key = ev.key;
					const target = ev.currentTarget;

					if (key === 'Enter') {
						const value = target.value;
						const trimmed = value.trim();

						if (trimmed.length === 0) {
							if (value !== trimmed) {
								target.value = '';
							}
						} else if (graphemeLen(trimmed) > 64 || trimmed.length > 640) {
							// @todo: should probably put a better alert mechanism tbh
							target.animate(
								[
									{ outlineColor: '#ef4444' },
									{ outlineColor: '#ef4444', offset: 0.3 },
									{ outlineColor: 'transparent' },
								],
								{
									duration: 350,
								},
							);
						} else {
							const tags = props.tags;
							const limit = props.limit;

							target.value = '';
							ev.preventDefault();

							onChange(props.tags.concat(trimmed));

							if (limit !== undefined && tags.length >= limit - 1) {
								moveFocus(target, MoveAction.LEFT);
							}
						}
					} else if (key === 'ArrowLeft') {
						const isStart = target.selectionStart === 0 && target.selectionStart === target.selectionEnd;

						if (isStart) {
							ev.preventDefault();
							moveFocus(target, MoveAction.LEFT);
						}
					} else if (key === 'Backspace') {
						const isStart = target.selectionStart === 0 && target.selectionStart === target.selectionEnd;

						if (isStart && props.tags.length > 0) {
							props.onChange(props.tags.slice(0, -1));
						}
					}
				}}
			/>
		</div>,
	] as unknown as JSX.Element;
};

export default TagsInput;
