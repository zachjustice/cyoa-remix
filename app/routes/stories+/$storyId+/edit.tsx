import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useOptionalCurrentStory } from '~/context/story-activity-context.tsx'
import { StoryEditor } from '~/routes/resources+/story-editor.tsx'
import { type loader } from '~/routes/stories+/$storyId+/_index.js'

export default function EditStoryRoute() {
	const location = useLocation()
	const fetcher = useFetcher<typeof loader>()
	let currentStory = useOptionalCurrentStory()
	const path = location.pathname?.replace('/edit', '')

	useEffect(() => {
		console.log(
			`## useEffect fetcher.data=${JSON.stringify(
				fetcher.data,
			)} currentStory=${JSON.stringify(currentStory)}`,
		)
		if (!currentStory && fetcher.state === 'idle' && fetcher.data == null) {
			fetcher.load(`${path}?index`)
		}
	}, [currentStory, path, fetcher])

	console.log(
		`## edit fetcher.data=${JSON.stringify(
			fetcher.data,
		)} currentStory=${JSON.stringify(currentStory)}`,
	)
	if (!currentStory && fetcher.data) {
		currentStory = fetcher.data?.story
	}

	return currentStory && <StoryEditor story={currentStory} />
}
