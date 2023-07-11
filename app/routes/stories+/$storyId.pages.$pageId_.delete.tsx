import { parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink } from '~/utils/forms.tsx'
import { usePageHistory } from '~/context/story-activity-context.tsx'

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

	// TODO specific "canDelete" role
	const page = await prisma.page.findUnique({
		where: { id: params.pageId },
		select: {
			ownerId: true,
		},
	})

	if (!page) {
		throw new Response('not found', { status: 404 })
	}

	if (page.ownerId !== userId) {
		throw new Response('user is not allowed to perform this action', {
			status: 401,
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

	if (prevPageId) {
		return redirect(`/stories/${params.storyId}/pages/${prevPageId}`)
	} else {
		return redirect(`/stories/${params.storyId}`)
	}
}

export default function DeletePageRoute() {
	const location = useLocation()
	const pageHistory = usePageHistory()
	const prevPage = pageHistory[pageHistory.length - 1]

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
						variant="primary"
						type="reset"
						// TODO explicitly fetch page and story id to construct URL instead of this which is unclear what it does
						to={location.pathname.replace('/delete', '')}
					>
						No, take me back
					</ButtonLink>
					<Button
						size="sm"
						variant="danger"
						// status={
						//     pageEditorFetcher.state === 'submitting'
						//         ? 'pending'
						//         : pageEditorFetcher.data?.status ?? 'idle'
						// }
						type="submit"
						// disabled={pageEditorFetcher.state !== 'idle'}
					>
						Yes, delete forever
					</Button>
				</div>
			</form>
		</>
	)
}
