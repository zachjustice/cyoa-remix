import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { MyButton, ButtonLink } from '~/utils/forms.tsx'
import { usePageHistory } from '~/context/story-activity-context.tsx'

export async function action({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)

	invariant(params.storyId, 'Missing storyId')

	// TODO specific "canDelete" role
	const story = await prisma.story.findUnique({
		where: { id: params.storyId },
		select: {
			ownerId: true,
		},
	})

	if (!story) {
		throw new Response('not found', { status: 404 })
	}

	if (story.ownerId !== userId) {
		throw new Response('user is not allowed to perform this action', {
			status: 401,
		})
	}

	await prisma.story.delete({
		where: { id: params.storyId },
	})

	return redirect(`/`)
}

export default function DeletePageRoute() {
	const location = useLocation()
	const pageHistory = usePageHistory()
	const prevPage = pageHistory[pageHistory.length - 1]

	return (
		<>
			<p>Are you sure you want to delete this story?</p>
			<p>This cannot be undone and all the work will be lost forever.</p>
			<form method="post">
				<input name="prevPageId" type="hidden" value={prevPage?.id} />
				<div className="mt-10 flex gap-4">
					<ButtonLink
						size="sm"
						color="primary"
						type="reset"
						// TODO explicitly fetch page and story id to construct URL instead of this which is unclear what it does
						to={location.pathname.replace('/delete', '')}
					>
						No, take me back
					</ButtonLink>
					<MyButton
						size="sm"
						color="danger"
						// status={
						//     pageEditorFetcher.state === 'submitting'
						//         ? 'pending'
						//         : pageEditorFetcher.data?.status ?? 'idle'
						// }
						type="submit"
						// disabled={pageEditorFetcher.state !== 'idle'}
					>
						Yes, delete it from existence
					</MyButton>
				</div>
			</form>
		</>
	)
}
