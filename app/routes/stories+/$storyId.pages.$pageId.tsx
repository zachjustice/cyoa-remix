import { type Choice, type Page } from '@prisma/client'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData, useParams, useSearchParams } from '@remix-run/react'
import { clsx } from 'clsx'
import invariant from 'tiny-invariant'
import EditableChoice from '~/components/EditableChoice.tsx'
import { EditIconLink } from '~/components/EditIcon.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { useEffect } from 'react'
import {
	usePageHistory,
	useStoryActivityDispatch,
	viewedPage,
} from '~/context/story-activity-context.tsx'

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
		isOwner: page.ownerId === userId,
	})
}

export default function GetPageRoute() {
	const { storyId } = useParams()
	const pageHistory = usePageHistory()
	invariant(storyId, 'Missing storyId')
	const { page, isOwner } = useLoaderData<typeof loader>()

	const [searchParams] = useSearchParams()
	const editChoiceId = isOwner
		? searchParams.get(`editChoiceId`) || undefined
		: undefined

	const dispatch = useStoryActivityDispatch()
	useEffect(() => {
		dispatch(viewedPage(page))
	})

	const pageNumber = 1 + pageHistory.findIndex(p => p.id === page.id)

	return (
		<div>
			<h2 className="pb-4 text-h2">Page {pageNumber}</h2>
			<div
				className={clsx(' flex gap-2', {
					'mb-6': isOwner,
					'mb-2': !isOwner,
				})}
			>
				{isOwner && <EditIconLink to="edit" variant="outline" />}
				<p className="preserve-whitespace">{page.content}</p>
			</div>

			<ul className="ml-12" key={page.id}>
				{page.nextChoices.map(choice => {
					return (
						<EditableChoice
							key={choice.id}
							editChoiceId={editChoiceId}
							storyId={storyId}
							pageId={page.id}
							choice={choice}
							editable={isOwner}
						/>
					)
				})}
			</ul>

			{isOwner && page.nextChoices.length < 4 && (
				<div className="mt-6">
					<ChoiceEditor
						choice={{
							parentPageId: page.id,
							storyId: storyId,
						}}
					/>
				</div>
			)}
		</div>
	)
}
