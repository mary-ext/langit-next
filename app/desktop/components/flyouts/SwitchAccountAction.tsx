import { For, type JSX } from 'solid-js';

import type { At } from '~/api/atp-schema';
import { multiagent } from '~/api/globals/agent';

import { clsx } from '~/utils/misc';

import { Flyout, offsetlessMiddlewares } from '~/com/components/Flyout';
import CheckIcon from '~/com/icons/baseline-check';
import { MenuItem, MenuRoot } from '~/com/primitives/menu';

import DefaultUserAvatar from '~/com/assets/default-user-avatar.svg?url';

export interface SwitchAccountActionProps {
	value?: At.DID | undefined;
	exclude?: At.DID[];
	onChange: (next: At.DID) => void;
	children: JSX.Element;
}

const SwitchAccountAction = (props: SwitchAccountActionProps) => {
	return (
		<Flyout button={props.children} middleware={offsetlessMiddlewares} placement="bottom">
			{({ close, menuProps }) => (
				<div {...menuProps} class={/* @once */ MenuRoot()}>
					<For
						each={(() => {
							const accounts = multiagent.accounts;
							const exclusions = props.exclude;

							if (exclusions) {
								return accounts.filter((account) => !exclusions.includes(account.did));
							}

							return accounts;
						})()}
					>
						{(account) => (
							<button
								onClick={() => {
									close();
									props.onChange(account.did);
								}}
								class={/* @once */ MenuItem()}
							>
								<img
									src={account.profile?.avatar || DefaultUserAvatar}
									class="h-9 w-9 shrink-0 rounded-full"
								/>

								<div class="mx-1 min-w-0 grow text-sm">
									<p class="overflow-hidden text-ellipsis whitespace-nowrap font-bold empty:hidden">
										{account.profile?.displayName}
									</p>
									<p class="overflow-hidden text-ellipsis whitespace-nowrap text-de text-muted-fg">
										{'@' + account.session.handle}
									</p>
								</div>

								<CheckIcon
									class={clsx([`shrink-0 text-base text-accent`, account.did !== props.value && `invisible`])}
								/>
							</button>
						)}
					</For>
				</div>
			)}
		</Flyout>
	);
};

export default SwitchAccountAction;
