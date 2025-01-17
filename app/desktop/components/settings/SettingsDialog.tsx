import { type ComponentProps, For, type JSX, Suspense, createMemo, createSignal } from 'solid-js';

import { Freeze } from '@mary/solid-freeze';

import { closeModal } from '~/com/globals/modals';

import { clsx } from '~/utils/misc';

import { DialogRoot } from '~/com/primitives/dialog';
import { IconButton } from '~/com/primitives/icon-button';
import { Interactive } from '~/com/primitives/interactive';

import CircularProgress from '~/com/components/CircularProgress';
import DialogOverlay from '~/com/components/dialogs/DialogOverlay';

import BackHandIcon from '~/com/icons/baseline-back-hand';
import CloseIcon from '~/com/icons/baseline-close';
import ColorLensIcon from '~/com/icons/baseline-color-lens';
import InfoIcon from '~/com/icons/baseline-info';
import LanguageIcon from '~/com/icons/baseline-language';
import PeopleIcon from '~/com/icons/baseline-people';

import SettingsRouterView from './settings-views/SettingsRouterView';
import {
	RouterContext,
	type RouterState,
	VIEW_ABOUT,
	VIEW_ACCOUNTS,
	VIEW_CONTENT,
	VIEW_INTERFACE,
	VIEW_MODERATION,
	type View,
	type ViewType,
	useViewRouter,
} from './settings-views/_router';

const SettingsDialog = () => {
	const [views, setViews] = createSignal<View[]>([{ type: VIEW_ACCOUNTS }]);
	const current = createMemo(() => views().at(-1)!);

	const router: RouterState = {
		get current() {
			return current();
		},
		get canGoBack() {
			return views().length > 1;
		},
		back() {
			const $views = views();

			if ($views.length > 1) {
				setViews($views.slice(0, -1));
			}
		},
		to(next) {
			setViews(views().concat(next));
		},
		replace: (next) => {
			setViews([next]);
		},
	};

	return (
		<RouterContext.Provider value={router}>
			<DialogOverlay>
				<div class={/* @once */ DialogRoot({ size: 'xl', fullHeight: true, maxHeight: 'sm' })}>
					<div class="flex min-w-0 grow overflow-hidden">
						<div class="flex w-60 shrink-0 flex-col bg-secondary/10">
							<div class="flex h-13 min-w-0 shrink-0 items-center gap-2 px-4">
								<button
									onClick={closeModal}
									title="Close dialog"
									class={/* @once */ IconButton({ edge: 'left' })}
								>
									<CloseIcon />
								</button>
							</div>
							<div class="flex grow flex-col overflow-y-auto">
								<SideItem to={VIEW_ACCOUNTS} icon={PeopleIcon}>
									Accounts
								</SideItem>
								<SideItem to={VIEW_INTERFACE} icon={ColorLensIcon}>
									Interface
								</SideItem>
								<SideItem to={VIEW_CONTENT} icon={LanguageIcon}>
									Content
								</SideItem>
								<SideItem to={VIEW_MODERATION} icon={BackHandIcon}>
									Moderation
								</SideItem>

								<SideItem to={VIEW_ABOUT} icon={InfoIcon}>
									About
								</SideItem>
							</div>
							<div class="flex min-w-0 items-center gap-4 p-4">
								<a
									target="_blank"
									href="https://mary.my.id/donate"
									class="text-sm text-accent hover:underline"
								>
									Donate
								</a>
							</div>
						</div>
						<div class="flex grow flex-col overflow-hidden overflow-y-auto border-l border-divider">
							<For each={views()}>
								{(view) => (
									<Freeze freeze={current() !== view}>
										<Suspense
											fallback={
												<div class="grid grow place-items-center">
													<CircularProgress />
												</div>
											}
										>
											<SettingsRouterView view={view} />
										</Suspense>
									</Freeze>
								)}
							</For>
						</div>
					</div>
				</div>
			</DialogOverlay>
		</RouterContext.Provider>
	);
};

export default SettingsDialog;

const sideItem = Interactive({
	variant: 'muted',
	class: `flex shrink-0 items-center gap-4 px-4 py-3 text-left text-sm disabled:opacity-50`,
});

type IconComponent = (props: ComponentProps<'svg'>) => JSX.Element;

type Exactly<T, U extends T> = { [K in keyof U]: K extends keyof T ? T[K] : never };
type StandaloneViews<V extends { type: ViewType } = View> =
	V extends Exactly<{ type: ViewType }, V> ? V : never;

type StandaloneViewType = StandaloneViews['type'];

const SideItem = (props: { icon?: IconComponent; to: StandaloneViewType; children: JSX.Element }) => {
	const router = useViewRouter();

	return (
		<button
			onClick={() => router.replace({ type: props.to })}
			class={clsx([sideItem, router.current.type === props.to && `bg-secondary/20`])}
		>
			{(() => {
				const Icon = props.icon;
				if (Icon) {
					return <Icon class="shrink-0 text-lg" />;
				}
			})()}
			<span class="grow">{props.children}</span>
		</button>
	);
};
