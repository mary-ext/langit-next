import { For, Show, batch, createMemo } from 'solid-js';

import { GLOBAL_LABELS } from '~/api/moderation';

import { preferences } from '~/desktop/globals/settings';

import { formatAbsDateTime } from '~/utils/intl/time';

import { bustModeration } from '~/com/globals/shared';

import { IconButton } from '~/com/primitives/icon-button';
import { ListBox, ListGroup, ListGroupBlurb, ListGroupHeader } from '~/com/primitives/list-box';

import ArrowLeftIcon from '~/com/icons/baseline-arrow-left';

import DefaultLabelerAvatar from '~/com/assets/default-labeler-avatar.svg?url';

import { type ViewParams, VIEW_LABELER_CONFIG, VIEW_MODERATION, useViewRouter } from '../_router';
import { CheckItem } from '../_components';

import LabelItem from './components/LabelItem';

const LabelerConfigView = () => {
	const router = useViewRouter();
	const { did } = router.current as ViewParams<typeof VIEW_LABELER_CONFIG>;

	const moderation = preferences.moderation;
	const services = moderation.services;
	const globalPrefs = moderation.labels;

	return (
		<Show when={services.find((service) => service.did === did)} keyed>
			{(service) => {
				const profile = service.profile;
				const localPrefs = service.prefs;

				return (
					<div class="contents">
						<div class="flex h-13 shrink-0 items-center gap-2 border-b border-divider px-4">
							<button
								title="Return to previous screen"
								onClick={() => router.move({ type: VIEW_MODERATION })}
								class={/* @once */ IconButton({ edge: 'left' })}
							>
								<ArrowLeftIcon />
							</button>

							<div class="grow">
								<h2 class="text-base font-bold leading-5">Label provider preferences</h2>
								<p class="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-fg empty:hidden">
									{'@' + profile.handle}
								</p>
							</div>
						</div>
						<div class="flex grow flex-col gap-6 overflow-y-auto p-4">
							<div class={ListGroup}>
								<p class={ListGroupHeader}>About this label provider</p>

								<div class="mt-2">
									<div class="flex items-start gap-4">
										<img
											src={profile.avatar || DefaultLabelerAvatar}
											class="h-12 w-12 shrink-0 self-start rounded-md"
										/>

										<div class="mt-0.5 flex min-w-0 grow flex-col text-sm">
											<p class="overflow-hidden text-ellipsis text-base font-medium empty:hidden">
												{profile.displayName}
											</p>
											<p class="overflow-hidden text-ellipsis text-sm text-muted-fg">
												{'@' + profile.handle}
											</p>
										</div>
									</div>

									<p class="mt-4 text-ellipsis whitespace-pre-wrap text-sm empty:hidden">
										{profile.description}
									</p>
								</div>
							</div>

							<div class={ListGroup}>
								<p class={ListGroupHeader}>Available policies</p>

								{(() => {
									const indexedAt = service.indexedAt;
									if (indexedAt !== undefined) {
										const fmt = formatAbsDateTime(indexedAt);
										return <p class={ListGroupBlurb}>Last updated on {fmt}</p>;
									}
								})()}

								<div class={ListBox}>
									<For each={service.vals.filter((v) => v[0] !== '!')}>
										{(identifier) => {
											const lookup = createMemo(
												() => {
													const defs = service.defs;

													if (identifier in defs) {
														return { global: false, def: defs[identifier], prefs: localPrefs };
													} else if (identifier in GLOBAL_LABELS) {
														return { global: true, def: GLOBAL_LABELS[identifier], prefs: globalPrefs };
													}
												},
												undefined,
												{ equals: (a, b) => a?.def === b?.def },
											);

											return (
												<Show when={lookup()} keyed>
													{({ global, def, prefs }) => {
														return (
															<LabelItem
																def={def}
																value={prefs[identifier]}
																showDefault={!global}
																global={global}
																onChange={(next) => {
																	batch(() => {
																		prefs[identifier] = next;
																		bustModeration();
																	});
																}}
															/>
														);
													}}
												</Show>
											);
										}}
									</For>
								</div>
							</div>

							<div class={ListGroup}>
								<p class={ListGroupHeader}>Advanced</p>

								<div class={ListBox}>
									<CheckItem
										title="Apply takedowns from this provider"
										value={service.redact}
										onChange={(next) => (service.redact = next || undefined)}
									/>
								</div>
							</div>
						</div>
					</div>
				);
			}}
		</Show>
	);
};

export default LabelerConfigView;
