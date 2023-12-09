import { type DataFunctionArgs, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink } from '~/utils/forms.tsx'
import { useParams } from '@remix-run/react'

export async function action({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)

	invariant(params.storyId, 'Missing storyId')

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
			status: 403,
		})
	}

	await prisma.storyMember.deleteMany({
		where: { storyId: params.storyId },
	})

	await prisma.story.delete({
		where: { id: params.storyId },
	})

	// TODO success page?
	return redirect(`/`)
}

export default function DeleteStoryRoute() {
	const { storyId } = useParams()

	invariant(storyId, 'Missing storyId')

	return (
		<>
			<p>Are you sure you want to delete this story?</p>
			<p>This cannot be undone and all the work will be lost forever.</p>
			<form method="post">
				<input type="hidden" id="storyId" value={storyId} />
				<div className="mt-10 flex gap-4">
					<ButtonLink
						size="sm"
						color="primary"
						type="reset"
						to={`/stories/${storyId}/edit`}
					>
						No, take me back
					</ButtonLink>
					<Button
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
					</Button>
				</div>
			</form>
		</>
	)
}
