import { type Choice, type Page } from '@prisma/client'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { PageViewer } from '~/routes/resources+/page-viewer.tsx'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'

export type ViewedChoice = Pick<Choice, 'id' | 'content' | 'nextPageId'>

export interface ViewedPage extends Pick<Page, 'id' | 'content' | 'ownerId'> {
	nextChoices: ViewedChoice[]
}

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing pageId')

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
			ownerId: true,
		},
	})

	if (!page) {
		throw new Response('not found', { status: 404 })
	}
	return json({
		page,
		storyId: params.storyId,
		isOwner: page.ownerId === userId,
	})
}

export default function GetPageRoute() {
	const data: { page: ViewedPage; storyId: string; isOwner: boolean } =
		useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const editChoiceId = data.isOwner
		? searchParams.get(`editChoiceId`) || undefined
		: undefined

	return (
		<PageViewer
			page={data.page}
			storyId={data.storyId}
			editable={data.isOwner}
			editChoiceId={editChoiceId}
		/>
	)
}
