import { createMemo, createSignal as signal } from 'solid-js';
import TextareaAutosize from 'solid-textarea-autosize';

import { XRPCError } from '@atcute/client';
import type { AppBskyActorProfile } from '@atcute/client/lexicons';
import { createMutation, useQueryClient } from '@mary/solid-query';

import { multiagent } from '~/api/globals/agent';
import { uploadBlob } from '~/api/mutations/upload-blob';
import { getProfileKey } from '~/api/queries/get-profile';
import { EOF_WS_RE } from '~/api/richtext/composer';
import { graphemeLen } from '~/api/richtext/intl';
import type { SignalizedProfile } from '~/api/stores/profiles';
import { formatQueryError } from '~/api/utils/misc';

import { model } from '~/utils/input';
import { formatLong } from '~/utils/intl/number';

import { Button } from '~/com/primitives/button';
import { Input } from '~/com/primitives/input';
import { Textarea } from '~/com/primitives/textarea';

import BlobImage from '~/com/components/BlobImage';
import AddPhotoButton from '~/com/components/inputs/AddPhotoButton';

import { usePaneModalState } from '../PaneContext';
import PaneDialog from '../PaneDialog';
import PaneDialogHeader from '../PaneDialogHeader';

export interface ProfileSettingsPaneDialogProps {
	/** Expected to be static */
	profile: SignalizedProfile;
}

const MAX_DESC_LENGTH = 300;

const profileRecordType = 'app.bsky.actor.profile';

type ProfileRecord = AppBskyActorProfile.Record;

const ProfileSettingsPaneDialog = (props: ProfileSettingsPaneDialogProps) => {
	const queryClient = useQueryClient();

	const { disableBackdropClose, close } = usePaneModalState();

	const prof = props.profile;

	const [avatar, setAvatar] = signal<Blob | string | undefined>(prof.avatar.value || undefined);
	const [banner, setBanner] = signal<Blob | string | undefined>(prof.banner.value || undefined);
	const [name, setName] = signal(prof.displayName.value || '');
	const [desc, setDesc] = signal(prof.description.value || '');

	const actualDesc = createMemo(() => desc().replace(EOF_WS_RE, ''));
	const length = createMemo(() => graphemeLen(actualDesc()));

	const profileMutation = createMutation(() => ({
		mutationFn: async () => {
			let prev: ProfileRecord | undefined;
			let swap: string | undefined;

			const uid = prof.uid;

			const $avatar = avatar();
			const $banner = banner();
			const $name = name();
			const $description = actualDesc();

			const agent = await multiagent.connect(uid);

			// 1. Retrieve the actual record to replace
			try {
				const response = await agent.rpc.get('com.atproto.repo.getRecord', {
					params: {
						repo: uid,
						collection: profileRecordType,
						rkey: 'self',
					},
				});

				const data = response.data;

				prev = data.value as any;
				swap = data.cid;
			} catch (err) {
				// If it's anything else than an InvalidRequest (not found), throw an error

				if (!(err instanceof XRPCError) || err.kind !== 'InvalidRequest') {
					throw err;
				}
			}

			// 2. Merge our changes
			{
				const nextAvatar =
					$avatar === undefined
						? undefined
						: $avatar instanceof Blob
							? await uploadBlob<any>(uid, $avatar)
							: prev?.avatar;

				const nextBanner =
					$banner === undefined
						? undefined
						: $banner instanceof Blob
							? await uploadBlob<any>(uid, $banner)
							: prev?.banner;

				let record: ProfileRecord | undefined = prev;

				if (record) {
					record.avatar = nextAvatar;
					record.banner = nextBanner;
					record.displayName = $name;
					record.description = $description;
					record.labels = record.labels;
				} else {
					record = {
						$type: 'app.bsky.actor.profile',
						avatar: nextAvatar,
						banner: nextBanner,
						displayName: $name,
						description: $description,
					};
				}

				await agent.rpc.call('com.atproto.repo.putRecord', {
					data: {
						repo: uid,
						collection: profileRecordType,
						rkey: 'self',
						swapRecord: swap,
						record: record,
					},
				});

				await Promise.allSettled([
					queryClient.invalidateQueries({ queryKey: getProfileKey(prof.uid, prof.did) }),
					// this should be impossible, as we don't allow arbitrary routing
					// queryClient.invalidateQueries({ queryKey: getProfileKey(prof.uid, prof.handle.value) }),
				]);
			}
		},
		onSuccess: () => {
			close();
		},
	}));

	const handleSubmit = (ev: SubmitEvent) => {
		ev.preventDefault();
		profileMutation.mutate();
	};

	return (
		<PaneDialog>
			<form onSubmit={handleSubmit} class="contents">
				<PaneDialogHeader
					title="Edit profile"
					disabled={(disableBackdropClose.value = profileMutation.isPending)}
				>
					<button
						type="submit"
						disabled={length() > MAX_DESC_LENGTH}
						class={/* @once */ Button({ variant: 'primary', size: 'xs' })}
					>
						Save
					</button>
				</PaneDialogHeader>

				{(() => {
					if (profileMutation.isError) {
						return (
							<div
								title={formatQueryError(profileMutation.error)}
								class="shrink-0 bg-red-500 px-4 py-3 text-sm text-white"
							>
								Something went wrong, try again later.
							</div>
						);
					}
				})()}

				<fieldset disabled={profileMutation.isPending} class="block min-h-0 grow overflow-y-auto">
					<div class="relative mb-4 aspect-banner w-full bg-muted-fg">
						{(() => {
							const $banner = banner();

							if ($banner) {
								return <BlobImage src={$banner} class="h-full w-full object-cover" />;
							}
						})()}

						<AddPhotoButton
							exists={!!banner()}
							title="Add banner image"
							maxWidth={3000}
							maxHeight={1000}
							onPick={setBanner}
						/>
					</div>

					<div class="relative mx-4 -mt-11 aspect-square h-20 w-20 overflow-hidden rounded-full bg-muted-fg outline-2 outline-background outline">
						{(() => {
							const $avatar = avatar();

							if ($avatar) {
								return <BlobImage src={$avatar} class="h-full w-full object-cover" />;
							}
						})()}

						<AddPhotoButton
							exists={!!avatar()}
							title="Add avatar image"
							maxWidth={1000}
							maxHeight={1000}
							onPick={setAvatar}
						/>
					</div>

					<label class="mx-4 mt-4 block">
						<span class="mb-2 block text-sm font-medium leading-6 text-primary">Name</span>
						<input ref={model(name, setName)} type="text" required class={/* @once */ Input()} />
					</label>

					<label class="mx-4 mt-4 block">
						<span class="mb-2 flex items-center justify-between gap-2 text-sm font-medium leading-6 text-primary">
							<span>Description</span>
							<span
								class={
									'text-xs' +
									(length() > MAX_DESC_LENGTH ? ' font-bold text-red-500' : ' font-normal text-muted-fg')
								}
							>
								{formatLong(length())}/{/* @once */ formatLong(MAX_DESC_LENGTH)}
							</span>
						</span>

						<TextareaAutosize
							value={desc()}
							onInput={(ev) => setDesc(ev.target.value)}
							minRows={4}
							class={/* @once */ Textarea()}
						/>
					</label>
				</fieldset>
			</form>
		</PaneDialog>
	);
};

export default ProfileSettingsPaneDialog;
