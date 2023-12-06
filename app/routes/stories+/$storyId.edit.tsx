import { useParams } from '@remix-run/react'
import { StoryEditor } from '~/routes/resources+/story-editor.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { type CurrentStory } from '~/context/story-activity-context.tsx'

export default function EditStoryRoute() {
	const params = useParams()
	const { story, canDeleteStory } = useMatchesData(
		`/stories/${params.storyId}`,
	) as {
		story: CurrentStory
		canDeleteStory: boolean
	}

	return story && <StoryEditor story={story} canDeleteStory={canDeleteStory} />
}
