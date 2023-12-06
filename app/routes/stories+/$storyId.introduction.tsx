import { Link, useParams } from '@remix-run/react'
import {
	type CurrentStory,
	useOptionalCurrentStory,
	usePageHistory,
	useStoryActivityDispatch,
	viewedStory,
} from '~/context/story-activity-context.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { formatPublishDate } from '~/utils/dateFormat.ts'
import { ButtonLink } from '~/utils/forms.tsx'
import { useEffect, useState } from 'react'

export default function GetStoryIntroductionRoute() {
	const currentStory = useOptionalCurrentStory()
	const pageHistory = usePageHistory()
	const dispatch = useStoryActivityDispatch()
	const params = useParams()
	const { story, canEditPage, canEditStorySettings } = useMatchesData(
		`/stories/${params.storyId}`,
	) as {
		story: CurrentStory
		isOwner: boolean
		canEditPage: boolean
		canEditStorySettings: boolean
	}

	const [lastPageId, setPageId] = useState('')

	useEffect(() => {
		setPageId(pageHistory[pageHistory?.length - 1]?.id)
		if (currentStory?.id !== params.storyId) {
			dispatch(viewedStory(story))
		}
	}, [pageHistory, currentStory?.id, params.storyId, dispatch, story])

	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow">
				<h2 className="text-h2 ">{story.title}</h2>
				<p className="text-md md:text-md mb-2 lg:mb-6">
					By{' '}
					<Link
						to={`/users/${story.owner.username}`}
						className="italic underline"
					>
						{story.owner.username}
					</Link>
					{' | '}Published {formatPublishDate(story.createdAt)}
				</p>
				<p className="preserve-whitespace text-sm md:text-lg">
					{story.description}
				</p>
				<div className="mt-10 flex gap-4">
					{pageHistory.length === 0 ? (
						<ButtonLink
							to={
								story.firstPageId
									? `/stories/${story.id}/pages/${story.firstPageId}/`
									: `/stories/${story.id}/pages/new/`
							}
							size="sm"
							color="primary"
							type="submit"
							onClick={() => {}}
						>
							{story.firstPageId ? 'Begin' : 'Write the first page'}
						</ButtonLink>
					) : (
						<ButtonLink
							color="primary"
							to={`/stories/${story.id}/pages/${lastPageId}`}
						>
							Resume reading
						</ButtonLink>
					)}

					{canEditPage && (
						<ButtonLink
							size="sm"
							color="secondary"
							to={`/stories/${story.id}/edit`}
						>
							Edit
						</ButtonLink>
					)}
					{canEditStorySettings && (
						<ButtonLink
							size="sm"
							color="secondary"
							to={`/stories/${story.id}/settings`}
						>
							Settings
						</ButtonLink>
					)}
				</div>
			</div>
		</div>
	)
}
