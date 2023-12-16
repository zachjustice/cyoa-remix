import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { useLoaderData, useParams } from '@remix-run/react'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server.ts'
import invariant from 'tiny-invariant'
import { prisma } from '~/utils/db.server.ts'
import { requireStoryEditor } from '~/utils/permissions.server.ts'
import { useMatchesData } from '~/hooks/useMatchesData.ts'

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing pageId')

	await requireStoryEditor(params.storyId, userId)

	const page = await prisma.page.findUnique({
		where: { id: params.pageId },
		select: {
			id: true,
			content: true,
			nextChoices: {
				select: {
					id: true,
					content: true,
					nextPageId: true,
				},
			},
		},
	})

	if (!page) {
		throw new Response('not found', { status: 404 })
	}

	return json({
		page,
	})
}

export default function EditPageRoute() {
	const params = useParams()
	const { page } = useLoaderData<typeof loader>()

	const { canDeletePage } = useMatchesData(`/stories/${params.storyId}`) as {
		canDeletePage: boolean
	}

	return (
		<PageEditor
			page={{ ...page, storyId: params.storyId }}
			canDeletePage={canDeletePage}
		/>
	)
}
