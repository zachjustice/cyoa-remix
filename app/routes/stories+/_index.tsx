import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
	type CurrentStory,
	isCurrentStory,
	useStoryActivityDispatch,
} from '~/context/story-activity-context.tsx'
import { formatPublishDate } from '~/utils/dateFormat.ts'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const stories = await prisma.story.findMany({
		select: {
			id: true,
			title: true,
			description: true,
			createdAt: true,
			owner: {
				select: {
					username: true,
				},
			},
		},
	})

	return json({
		stories,
	})
}
export default function GetStoriesRoute() {
	const { stories } = useLoaderData<typeof loader>()
	const dispatch = useStoryActivityDispatch()

	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-400 pl-2 md:container md:rounded">
				<main className="col-span-3 px-10 py-12 md:rounded">
					<h1 className="mb-8 text-h1">Stories</h1>
					<ul>
						{stories.map(story => {
							return (
								<li key={story.id}>
									<h2 className="text-body-md font-bold underline">
										<Link to={`/stories/${story.id}/introduction`}>
											{story.title}
										</Link>
									</h2>
									<p>{story.description}</p>
									<p className="text-md md:text-md mb-2 text-neutral-400 lg:mb-6">
										By{' '}
										<Link
											to={`/users/${story.owner.username}`}
											className="italic underline"
										>
											{story.owner.username}
										</Link>
										{' | '}Published {formatPublishDate(story.createdAt)}
									</p>
								</li>
							)
						})}
					</ul>
				</main>
			</div>
		</div>
	)
}
