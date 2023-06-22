import { StoryEditor } from '~/routes/resources+/story-editor.tsx'

export default function CreateStoryRoute() {
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-400 pl-2 md:container md:rounded">
				<main className="col-span-3 px-10 py-12 md:rounded-r-3xl">
					<StoryEditor />
				</main>
			</div>
		</div>
	)
}
