import { StoryEditor } from '~/routes/resources+/story-editor.tsx'

export default function CreateStoryRoute() {
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-6 bg-night-500 md:container md:rounded">
				<main className="col-span-4 col-start-2 bg-night-400 px-10 py-12 md:rounded">
					<div className="mx-2">
						<StoryEditor />
					</div>
				</main>
			</div>
		</div>
	)
}
