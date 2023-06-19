import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { EditIconLink } from '~/components/EditIcon.tsx'
import { useStoryActivityDispatch } from '~/context/story-activity-context.tsx'
import { useOptionalUser } from '~/hooks/useUser.ts'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import styles from '~/routes/resources+/Page.module.css'
import {
	type ViewedChoice,
	type ViewedPage,
} from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.js'

type ChoiceProps = {
	page: ViewedPage
	storyId: string
	editable: boolean
	choice: ViewedChoice
	editChoiceId?: string
}

export default function Choice(props: ChoiceProps) {
	const { storyId, editable, page, choice } = props
	const dispatch = useStoryActivityDispatch()
	const optionalUser = useOptionalUser()

	const onClickHandler = (page: ViewedPage, choice: ViewedChoice) => {
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
	}

	let link = choice.nextPageId
		? `/stories/${storyId}/pages/${choice.nextPageId}`
		: optionalUser
		? `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`
		: '/signup'

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
					className={clsx(
						'hover:text-neutral-400',
						{ [styles.selectedChoice]: choice.isChosen }, // TODO fix types
					)}
					onClick={() => onClickHandler(page, choice)}
				>
					{choice.content}
				</Link>
			</li>
		)
	}
}
