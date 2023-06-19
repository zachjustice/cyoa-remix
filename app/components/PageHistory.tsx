import {
	useOptionalCurrentStory,
	usePageHistory,
} from '~/context/story-activity-context.tsx'
import { PageViewer } from '~/routes/resources+/page-viewer.tsx'

export function PageHistory() {
	const currentStory = useOptionalCurrentStory()
	const pageHistory = usePageHistory()

	if (!currentStory) {
		return null
	}

	return (
		<>
			{pageHistory.reverse().map((page, index) => {
				return (
					<div
						key={page.id}
						className="flex flex-row border-t-2 border-b-gray-400 border-t-gray-400 pb-6 pt-6"
					>
						<div className="w-7 flex-none content-center">
							<p className="font-bold text-gray-400">
								{pageHistory.length - index}
							</p>
						</div>
						<div className="col-span-11 ">
							<PageViewer
								editable={false}
								page={page}
								storyId={currentStory.id}
							/>
						</div>
					</div>
				)
			})}
		</>
	)
}
