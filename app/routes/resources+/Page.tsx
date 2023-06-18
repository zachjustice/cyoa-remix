import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { useStoryActivityDispatch } from '~/context/story-activity-context.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import { type ViewedPage } from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import styles from './Page.module.css'

type ChoiceListProps = {
	page: ViewedPage
	storyId: string
}

function ChoiceList({ page, storyId }: ChoiceListProps) {
	const dispatch = useStoryActivityDispatch()

	return page.nextChoices.map(choice => {
		let link = choice.nextPageId
			? `/stories/${storyId}/pages/${choice.nextPageId}`
			: `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`
		return (
			<li key={choice.id}>
				<Link
					to={link}
					className={clsx(
						'hover:text-neutral-400',
						{ [styles.selectedChoice]: choice.isChosen }, // TODO fix types
					)}
					onClick={() => {
						dispatch({
							type: 'add-to-page-history',
							payload: {
								...page,
								nextChoices: page.nextChoices.map(nextChoice => ({
									...nextChoice,
									isChosen: choice.id === nextChoice.id,
								})),
							},
						})
					}}
				>
					{choice.content}
				</Link>
			</li>
		)
	})
}

type PageProps = {
	page: ViewedPage //{nextChoices: Choice[]} extends Page,
	storyId: string
	editable: boolean
}

export function PageViewer({ page, storyId, editable = false }: PageProps) {
	return (
		<div className="flex flex-col">
			<div className="flex-grow">
				<p className="mb-5">{page.content}</p>
				<ul key={page.id}>
					{...ChoiceList({ page, storyId })}
					{editable && page.nextChoices.length < 4 && (
						<ChoiceEditor
							choice={{
								parentPageId: page.id,
								storyId: storyId,
							}}
						/>
					)}
				</ul>
				{editable ? (
					<div className="flex gap-4">
						<ButtonLink size="sm" variant="primary" to="edit">
							Edit
						</ButtonLink>
					</div>
				) : null}
			</div>
		</div>
	)
}
