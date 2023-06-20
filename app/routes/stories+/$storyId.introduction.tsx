import { Link, useMatches, useParams } from '@remix-run/react'
import {
	type CurrentStory,
	useStoryActivityDispatch,
} from '~/context/story-activity-context.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { formatPublishDate } from '~/utils/dateFormat.ts'
import { ButtonLink } from '~/utils/forms.tsx'

export default function GetStoryIntroductionRoute() {
	const dispatch = useStoryActivityDispatch()
	const params = useParams()
	const { story, isOwner } = useMatchesData(`/stories/${params.storyId}`) as {
		story: CurrentStory
		isOwner: Boolean
	}

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
				<p className="text-sm md:text-lg">{story.description}</p>
				<div className="mt-10 flex gap-4">
					<ButtonLink
						to={
							story.firstPageId
								? `/stories/${story.id}/pages/${story.firstPageId}/`
								: `/stories/${story.id}/pages/new/`
						}
						size="sm"
						variant="primary"
						type="submit"
						onClick={() => {
							dispatch({
								type: 'view-story',
								payload: story as CurrentStory,
							})
						}}
					>
						Begin
					</ButtonLink>

					{isOwner ? (
						<ButtonLink
							size="sm"
							variant="secondary"
							to={`/stories/${story.id}/edit`}
						>
							Edit
						</ButtonLink>
					) : null}
				</div>
			</div>
		</div>
	)
}
