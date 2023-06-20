import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useOptionalCurrentStory } from '~/context/story-activity-context.tsx'
import { StoryEditor } from '~/routes/resources+/story-editor.tsx'
import { type loader } from '~/routes/stories+/$storyId.tsx'

export default function EditStoryRoute() {
	const location = useLocation()
	const fetcher = useFetcher<typeof loader>()
	let currentStory = useOptionalCurrentStory()

	const path = location.pathname?.replace('/edit', '')
	useEffect(() => {
		if (!currentStory && fetcher.state === 'idle' && fetcher.data == null) {
			fetcher.load(`${path}?index`)
		}
	}, [currentStory, path, fetcher])

	if (!currentStory && fetcher.data) {
		currentStory = fetcher.data?.story
	}

	return (
		currentStory && (
			// TODO fetcher.data?.isOwner &&
			<StoryEditor story={currentStory} />
		)
	)
}
