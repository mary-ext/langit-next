import { createRadioModel } from '~/utils/input';
import { getUniqueId } from '~/utils/misc';

import { PaneSize } from '~/desktop/globals/panes';
import { preferences } from '~/desktop/globals/settings';

import Radio from '~/com/components/inputs/Radio';
import Checkbox from '~/com/components/inputs/Checkbox';
import {
	ListBox,
	ListBoxItemReadonly,
	ListGroup,
	ListGroupBlurb,
	ListGroupHeader,
} from '~/com/primitives/list-box';

const AppearanceView = () => {
	const ui = preferences.ui;

	const themeId = getUniqueId();
	const themeModel = createRadioModel(
		() => ui.theme,
		(next) => (ui.theme = next),
	);

	const columnSizeId = getUniqueId();
	const paneSizeModel = createRadioModel(
		() => ui.defaultPaneSize,
		(next) => (ui.defaultPaneSize = next),
	);

	return (
		<div class="contents">
			<div class="flex h-13 shrink-0 items-center gap-2 border-b border-divider px-4">
				<h2 class="grow text-base font-bold">Appearance</h2>
			</div>
			<div class="flex grow flex-col gap-6 overflow-y-auto p-4">
				<div class={ListGroup}>
					<p class={ListGroupHeader}>Application theme</p>

					<div class={ListBox}>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Automatic</span>
							<Radio ref={themeModel('auto')} name={themeId} />
						</label>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Light</span>
							<Radio ref={themeModel('light')} name={themeId} />
						</label>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Dark</span>
							<Radio ref={themeModel('dark')} name={themeId} />
						</label>
					</div>
				</div>

				<div class={ListGroup}>
					<p class={ListGroupHeader}>Default column size</p>

					<div class={ListBox}>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Small</span>
							<Radio ref={paneSizeModel(PaneSize.SMALL)} name={columnSizeId} />
						</label>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Medium</span>
							<Radio ref={paneSizeModel(PaneSize.MEDIUM)} name={columnSizeId} />
						</label>
						<label class={ListBoxItemReadonly}>
							<span class="grow font-medium">Large</span>
							<Radio ref={paneSizeModel(PaneSize.LARGE)} name={columnSizeId} />
						</label>
					</div>
				</div>

				<div class={ListGroup}>
					<p class={ListGroupHeader}>Appearance</p>

					<div class={ListBox}>
						<label class={ListBoxItemReadonly}>
							<div class="grow">
								<p class="grow font-medium">Show profile media in grid form</p>
								<p class="text-de text-muted-fg">This will not affect feeds/lists panes</p>
							</div>
							<Checkbox
								checked={ui.profileMediaGrid}
								onChange={(ev) => {
									const next = ev.target.checked;
									ui.profileMediaGrid = next;
								}}
							/>
						</label>

						<label class={ListBoxItemReadonly}>
							<div class="grow">
								<p class="font-medium">Show thread replies in threaded form</p>
								<p class="text-de text-muted-fg">This is an experimental feature</p>
							</div>

							<Checkbox
								checked={ui.threadedReplies}
								onChange={(ev) => {
									const next = ev.target.checked;
									ui.threadedReplies = next;
								}}
							/>
						</label>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AppearanceView;
