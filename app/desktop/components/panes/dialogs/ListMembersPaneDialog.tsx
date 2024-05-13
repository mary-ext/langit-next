import type { SignalizedList } from '~/api/stores/lists';

import { LINK_PROFILE, useLinking } from '~/com/components/Link';
import ListMembersList from '~/com/components/lists/ListMembersList';

import PaneDialog from '../PaneDialog';
import PaneDialogHeader from '../PaneDialogHeader';

export interface ListMembersPaneDialogProps {
	/** Expected to be static */
	list: SignalizedList;
}

const ListMembersPaneDialog = (props: ListMembersPaneDialogProps) => {
	const linking = useLinking();

	const list = props.list;

	return (
		<PaneDialog>
			<PaneDialogHeader title="List members" subtitle={list.name.value} />

			<div class="flex min-h-0 grow flex-col overflow-y-auto">
				<ListMembersList
					list={list}
					onClick={(profile) => {
						linking.navigate({ type: LINK_PROFILE, actor: profile.did });
					}}
				/>
			</div>
		</PaneDialog>
	);
};

export default ListMembersPaneDialog;
