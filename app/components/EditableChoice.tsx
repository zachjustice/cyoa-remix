import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { EditIconLink } from '~/components/EditIcon.tsx'
import {
	type StoryActivityChoice,
	type StoryActivityPage,
	useStoryActivityDispatch,
} from '~/context/story-activity-context.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import styles from '~/routes/resources+/Page.module.css'
import {
	type ViewedChoice,
	type ViewedPage,
} from '~/routes/stories+/$storyId.pages.$pageId.tsx'

type ChoiceProps = {
	page: ViewedPage | StoryActivityPage
	storyId: string
	editable: boolean
	choice: ViewedChoice | StoryActivityChoice
	editChoiceId?: string
}

export default function EditableChoice(props: ChoiceProps) {
	const { storyId, editable, page, choice } = props
	const dispatch = useStoryActivityDispatch()

	const onClickHandler = (page: ViewedPage, choice: ViewedChoice) => {
		dispatch({
			type: 'make-choice',
			payload: {
				pageId: page.id,
				choiceId: choice.id,
			},
		})
	}

	let link: string
	if (choice.nextPageId) {
		link = `/stories/${storyId}/pages/${choice.nextPageId}`
	} else {
		link = `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`
	}

	if (editable && choice.id === props.editChoiceId) {
		return (
			<li>
				<ChoiceEditor choice={{ ...choice, storyId, parentPageId: page.id }} />
			</li>
		)
	} else {
		return (
			<li className="flex gap-2">
				{editable && (
					<div className="mb-2 justify-start hover:cursor-pointer">
						<EditIconLink to={`?editChoiceId=${choice.id}`} variant="outline" />
					</div>
				)}
				<Link
					to={link}
					className={clsx('hover:text-neutral-400', {
						[styles.selectedChoice]: choice.isChosen,
					})}
					onClick={() => onClickHandler(page, choice)}
				>
					{choice.content}
				</Link>
			</li>
		)
	}
}
