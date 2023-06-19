import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import EditIcon, { EditIconLink } from '~/components/EditIcon.tsx'
import { useStoryActivityDispatch } from '~/context/story-activity-context.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import { type ViewedPage } from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.tsx'
import styles from './Page.module.css'

function ChoiceList({ page, storyId, editable }: PageProps) {
	const dispatch = useStoryActivityDispatch()

	return page.nextChoices.map(choice => {
		let link = choice.nextPageId
			? `/stories/${storyId}/pages/${choice.nextPageId}`
			: `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`
		return (
			<li key={choice.id} className="flex gap-2">
				{editable && (
					<div className="mb-2 justify-start">
						<EditIconLink variant="outline" to="edit" />
					</div>
				)}
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
				<div
					className={clsx(' flex gap-2', {
						'mb-6': editable,
						'mb-2': !editable,
					})}
				>
					{editable && <EditIconLink to="edit" variant="outline" />}
					<p>{page.content}</p>
				</div>
				<ul className="ml-12" key={page.id}>
					{...ChoiceList({ page, storyId, editable })}
				</ul>
				{editable && page.nextChoices.length < 4 && (
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
		</div>
	)
}
