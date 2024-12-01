import { type Choice, type Page } from '@prisma/client'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData, useParams, useSearchParams } from '@remix-run/react'
import invariant from 'tiny-invariant'
import EditableChoice from '~/components/EditableChoice.tsx'
import { EditIconLink } from '~/components/EditIcon.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import { prisma } from '~/utils/db.server.ts'
import { useEffect } from 'react'
import {
	usePageHistory,
	useStoryActivityDispatch,
	viewedPage,
} from '~/context/story-activity-context.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { getUserId } from '~/utils/auth.server.ts'
import { requireStoryReader } from '~/utils/permissions.server.ts'

export type ViewedChoice = Pick<Choice, 'id' | 'content' | 'nextPageId'>

export interface ViewedPage extends Pick<Page, 'id' | 'content' | 'ownerId'> {
	nextChoices: ViewedChoice[]
}

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing pageId')

	const story = await prisma.story.findUnique({
		where: { id: params.storyId },
		select: { ownerId: true, isPublic: true },
	})

	if (!story) {
		throw new Response('not found', { status: 404 })
	}

	if (story.ownerId !== userId && !story.isPublic) {
		await requireStoryReader(params.storyId, userId)
	}

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
	})
}

export default function GetPageRoute() {
	const { storyId } = useParams()
	invariant(storyId, 'Missing storyId')

	const pageHistory = usePageHistory()
	const { page } = useLoaderData<typeof loader>()
	const { canEditPage, canEditChoice, canAddChoice } = useMatchesData(
		`/stories/${storyId}`,
	) as {
		canEditPage: boolean
		canEditChoice: boolean
		canAddChoice: boolean
	}

	const [searchParams] = useSearchParams()
	const editMode: boolean =
		!!searchParams.get(`editChoiceId`) ||
		!!searchParams.get(`addChoice`) ||
		!!searchParams.get('editPage') ||
		!!searchParams.get(`editChoiceId`)

	const editChoiceId = canEditChoice
		? searchParams.get(`editChoiceId`) || undefined
		: undefined

	const addChoice: boolean = canAddChoice
		? !!searchParams.get(`addChoice`)
		: false

	const dispatch = useStoryActivityDispatch()
	useEffect(() => {
		dispatch(viewedPage(page))
	})

	const pageNumber = 1 + pageHistory.findIndex(p => p.id === page.id)

	return (
		<div className="border-day-border h-full w-full max-w-2xl rounded border-[1px] bg-day-primary-highlight p-8 dark:border-night-border dark:bg-night-primary-highlight">
			<div className="flex gap-8">
				<h2 className="pb-4 text-h2">Page {pageNumber}</h2>
				{canEditPage &&
					(editMode ? (
						<ButtonLink color="secondary" className="h-fit w-fit" to="#">
							Done
						</ButtonLink>
					) : (
						<ButtonLink color="secondary" className="h-fit w-fit" to="edit">
							Edit
						</ButtonLink>
					))}
			</div>
			<div className="flex gap-2">
				{canEditPage && editMode && (
					<EditIconLink to="edit" variant="outline" />
				)}
				<p className="preserve-whitespace">{page.content}</p>
			</div>
			<h3 className="mb-2 mt-4 text-xl font-bold">
				{page?.nextChoices?.length ? 'Your choices are:' : ''}
			</h3>
			<ul className="ml-2 space-y-2" key={page.id}>
				{page.nextChoices.map(choice => {
					return (
						<EditableChoice
							key={choice.id}
							editChoiceId={editChoiceId}
							storyId={storyId}
							pageId={page.id}
							choice={choice}
							editable={editMode}
						/>
					)
				})}

				{editMode &&
					!addChoice &&
					canAddChoice &&
					page.nextChoices.length < 4 && (
						<div className="w-fit">
							<ButtonLink
								to={'?addChoice=true'}
								aria-disabled={!!editChoiceId}
								disabled={!!editChoiceId}
								color="primary"
							>
								Add another choice
							</ButtonLink>
						</div>
					)}
				{editMode &&
					addChoice &&
					canAddChoice &&
					page.nextChoices.length < 4 && (
						<ChoiceEditor
							choice={{
								parentPageId: page.id,
								storyId: storyId,
							}}
						/>
					)}
			</ul>
		</div>
	)
}
