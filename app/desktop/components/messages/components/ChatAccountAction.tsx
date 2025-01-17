import { For, type JSX, createMemo } from 'solid-js';

import { getPrivilegedAccounts } from '~/api/globals/agent';

import { MenuItem, MenuItemIcon, MenuRoot } from '~/com/primitives/menu';

import { Flyout, offsetlessMiddlewares } from '~/com/components/Flyout';

import SettingsOutlinedIcon from '~/com/icons/outline-settings';

import DefaultUserAvatar from '~/com/assets/default-user-avatar.svg?url';

import { useChatPane } from '../contexts/chat';
import { ViewKind } from '../contexts/router';

export interface ChatAccountActionProps {
	children: JSX.Element;
}

const ChatAccountAction = (props: ChatAccountActionProps) => {
	const { did, router, changeAccount } = useChatPane();

	const accounts = createMemo(getPrivilegedAccounts);

	return (
		<Flyout button={props.children} middleware={offsetlessMiddlewares} placement="bottom-end">
			{({ close, menuProps }) => (
				<div {...menuProps} class={/* @once */ MenuRoot()}>
					<button
						onClick={() => {
							close();
							router.to({ kind: ViewKind.SETTINGS });
						}}
						class={/* @once */ MenuItem()}
					>
						<SettingsOutlinedIcon class={/* @once */ MenuItemIcon()} />
						<span>Chat settings</span>
					</button>

					{accounts().length > 1 && (
						<>
							<hr class="mx-2 my-1 border-divider" />
							<For each={accounts().filter((acc) => acc.did !== did)}>
								{(account) => (
									<button
										onClick={() => {
											close();
											changeAccount(account.did);
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
									</button>
								)}
							</For>
						</>
					)}
				</div>
			)}
		</Flyout>
	);
};

export default ChatAccountAction;
