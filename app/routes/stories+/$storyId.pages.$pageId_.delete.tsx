import { parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { ButtonLink, MyButton } from '~/utils/forms.tsx'
import { usePageHistory } from '~/context/story-activity-context.tsx'
import { useParams } from '@remix-run/react'

export const DeletePageSchema = z.object({
	prevPageId: z.string().optional(),
})

export async function action({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing storyId')

	const submission = parse(formData, {
		schema: DeletePageSchema,
		acceptMultipleErrors: () => true,
	})

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { prevPageId } = submission.value

	const page = await prisma.page.findUnique({
		where: { id: params.pageId },
		select: {
			ownerId: true,
		},
	})

	if (!page) {
		throw new Response('not found', { status: 404 })
	}

	const story = await prisma.story.findUnique({
		where: { id: params.storyId },
		select: { ownerId: true },
	})

	if (!story) {
		throw new Response('not found', { status: 404 })
	}

	// TODO Decide if Story Editors can delete pages; role based authz?
	if (page.ownerId !== userId || story.ownerId !== userId) {
		throw new Response('user is not allowed to perform this action', {
			status: 403,
		})
	}

	await prisma.choice.updateMany({
		where: { nextPageId: params.pageId },
		data: {
			nextPageId: null,
		},
	})

	await prisma.page.delete({
		where: { id: params.pageId },
	})

	console.log('prevPageId', prevPageId)
	if (prevPageId) {
		return redirect(`/stories/${params.storyId}/pages/${prevPageId}`)
	} else {
		return redirect(`/stories/${params.storyId}/introduction`)
	}
}

export default function DeletePageRoute() {
	const { storyId, pageId } = useParams()
	invariant(pageId, 'Missing pageId')
	invariant(storyId, 'Missing storyId')
	const pageHistory = usePageHistory()
	const pageIndex = pageHistory.findIndex(p => p.id === pageId)
	const prevPage = pageHistory[pageIndex - 1]

	// TODO update page history on delete

	return (
		<>
			<p>Are you sure you want to delete this page?</p>
			<p>
				All the choices and pages that come after this page will be deleted,
				too.
			</p>
			<form method="post">
				<input name="prevPageId" type="hidden" value={prevPage?.id} />
				<div className="mt-10 flex gap-4">
					<ButtonLink
						size="sm"
						color="primary"
						type="reset"
						to={`/stories/${storyId}/pages/${pageId}`}
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
						Yes, delete forever
					</MyButton>
				</div>
			</form>
		</>
	)
}
