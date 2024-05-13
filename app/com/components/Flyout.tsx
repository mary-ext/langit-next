import { createSignal, getOwner, runWithOwner, untrack, type JSX } from 'solid-js';

import { makeEventListener } from '@solid-primitives/event-listener';

import { autoUpdate, flip, shift, size, type Middleware } from '@floating-ui/dom';
import { getSide, type Placement } from '@floating-ui/utils';
import { useFloating } from 'solid-floating-ui';

import { assert } from '~/utils/misc';

import { openModal, useModalState } from '../globals/modals';

export interface MenuContentProps {
	ref: (el: HTMLElement) => void;
	style: JSX.CSSProperties;
}

export interface MenuContext {
	close: () => void;
	menuProps: MenuContentProps;
}

export interface FlyoutProps {
	/** Expected to be static */
	placement?: Placement;
	/** Expected to be static */
	middleware?: Middleware[];
	button: JSX.Element;
	children: (context: MenuContext) => JSX.Element;
}

const isDesktop = import.meta.env.VITE_MODE === 'desktop';

export const offset: Middleware = {
	name: 'offset',
	fn(state) {
		const reference = state.rects.reference;
		const x = state.x;
		const y = state.y;

		const multi = getSide(state.placement) === 'bottom' ? 1 : -1;

		return {
			x: x,
			y: y - reference.height * multi,
		};
	},
};

const PADDING = isDesktop ? 16 : 8;

export const offsetlessMiddlewares = [
	flip({
		padding: PADDING,
		crossAxis: false,
	}),
	shift({
		padding: PADDING,
	}),
	size({
		padding: PADDING,
		apply({ availableWidth, availableHeight, elements }) {
			Object.assign(elements.floating.style, {
				maxWidth: `${availableWidth}px`,
				maxHeight: `${availableHeight}px`,
			});
		},
	}),
];

const defaultMiddlewares: Middleware[] = isDesktop
	? [offset, ...offsetlessMiddlewares]
	: offsetlessMiddlewares;

export const Flyout = (props: FlyoutProps) => {
	const owner = getOwner();

	const anchor = props.button;
	assert(anchor instanceof HTMLElement);

	makeEventListener(anchor, 'click', () => {
		openModal(() => {
			const { close } = useModalState();

			return runWithOwner(owner, () => {
				const [floating, setFloating] = createSignal<HTMLElement>();

				const position = useFloating(() => anchor, floating, {
					placement: props.placement ?? 'bottom-end',
					strategy: 'absolute',
					middleware: props.middleware ?? defaultMiddlewares,
					whileElementsMounted: autoUpdate,
				});

				const context: MenuContext = {
					menuProps: {
						ref: setFloating,
						get style() {
							return {
								position: position.strategy,
								top: `${position.y ?? 0}px`,
								left: `${position.x ?? 0}px`,
							};
						},
					},
					close: close,
				};

				return untrack(() => props.children(context)) as unknown as JSX.Element;
			});
		});
	});

	return anchor as unknown as JSX.Element;
};
