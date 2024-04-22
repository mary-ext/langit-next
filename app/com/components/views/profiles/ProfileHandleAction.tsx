import { lazy, type JSX } from 'solid-js';

import type { SignalizedProfile } from '~/api/stores/profiles';

import { openModal } from '../../../globals/modals';

import { MenuItem, MenuItemIcon, MenuRoot } from '../../../primitives/menu';

import { Flyout, offsetlessMiddlewares } from '../../Flyout';

import ContentCopyIcon from '../../../icons/baseline-content-copy';
import HistoryIcon from '../../../icons/baseline-history';
import LaunchIcon from '../../../icons/baseline-launch';

const HandleHistoryDialog = lazy(() => import('../../dialogs/HandleHistoryDialog'));

export interface ProfileHandleActionProps {
	profile: SignalizedProfile;
	children: JSX.Element;
}

const ProfileHandleAction = (props: ProfileHandleActionProps) => {
	return (() => {
		const profile = props.profile;
		const isPlc = profile.did.startsWith('did:plc:');

		if (import.meta.env.VITE_MODE === 'desktop') {
			return (
				<Flyout button={props.children} placement="bottom-start" middleware={offsetlessMiddlewares}>
					{({ close, menuProps }) => (
						<div {...menuProps} class={/* @once */ MenuRoot()}>
							{profile.handle.value !== 'handle.invalid' && (
								<a
									href={`https://${profile.handle.value}`}
									target="_blank"
									onClick={close}
									class={/* @once */ MenuItem()}
								>
									<LaunchIcon class={/* @once */ MenuItemIcon()} />
									<span>Open website</span>
								</a>
							)}

							<button
								onClick={() => {
									close();
									navigator.clipboard.writeText(profile.handle.value);
								}}
								class={/* @once */ MenuItem()}
							>
								<ContentCopyIcon class={/* @once */ MenuItemIcon()} />
								<span class="overflow-hidden text-ellipsis whitespace-nowrap">Copy handle</span>
							</button>

							<button
								onClick={() => {
									close();
									navigator.clipboard.writeText(profile.did);
								}}
								class={/* @once */ MenuItem()}
							>
								<ContentCopyIcon class={/* @once */ MenuItemIcon()} />
								<span class="overflow-hidden text-ellipsis whitespace-nowrap">Copy DID</span>
							</button>

							{isPlc && (
								<button
									onClick={() => {
										close();
										openModal(() => <HandleHistoryDialog profile={profile} />);
									}}
									class={/* @once */ MenuItem()}
								>
									<HistoryIcon class={/* @once */ MenuItemIcon()} />
									<span class="overflow-hidden text-ellipsis whitespace-nowrap">View handle history</span>
								</button>
							)}
						</div>
					)}
				</Flyout>
			);
		}

		return props.children;
	}) as unknown as JSX.Element;
};

export default ProfileHandleAction;
