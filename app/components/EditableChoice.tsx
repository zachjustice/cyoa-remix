import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { EditIconLink } from '~/components/EditIcon.tsx'
import {
	madeChoice,
	type StoryActivityChoice,
	usePageHistory,
	useStoryActivityDispatch,
} from '~/context/story-activity-context.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import styles from '~/routes/resources+/Page.module.css'
import { type ViewedChoice } from '~/routes/stories+/$storyId.pages.$pageId.tsx'
import { FaAngleRight } from 'react-icons/fa/index.js'

type ChoiceProps = {
	pageId: string
	storyId: string
	editable: boolean
	choice: StoryActivityChoice
	editChoiceId?: string
}

export default function EditableChoice(props: ChoiceProps) {
	const { storyId, editable, pageId, choice } = props
	const pageHistory = usePageHistory()
	const dispatch = useStoryActivityDispatch()
	const isChosen = pageHistory
		.find(p => p.id === pageId)
		?.nextChoices?.find(c => c.id === choice.id)?.isChosen

	const onClickHandler = (pageId: string, choice: ViewedChoice) => {
		dispatch(
			madeChoice({
				pageId: pageId,
				choiceId: choice.id,
			}),
		)
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
				<ChoiceEditor choice={{ ...choice, storyId, parentPageId: pageId }} />
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
					className={clsx('hover:text- flex items-center', {
						[styles.selectedChoice]: isChosen,
					})}
					onClick={() => onClickHandler(pageId, choice)}
				>
					<FaAngleRight /> {choice.content}
				</Link>
			</li>
		)
	}
}
