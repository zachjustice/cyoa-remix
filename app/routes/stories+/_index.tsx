import { type DataFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatPublishDate } from '~/utils/dateFormat.ts'
import { prisma } from '~/utils/db.server.ts'
import { getUserId } from '~/utils/auth.server.ts'
import { Prisma } from '.prisma/client'
import { Badge } from 'flowbite-react'
import { StoryPermissions } from '~/routes/stories+/$storyId.settings.tsx'
import StoryWhereInput = Prisma.StoryWhereInput

type StoryWithPermission = {
	id: string
	title: string
	description: string
	createdAt: string
	owner: {
		username: string
	}
	permission?: {
		name: string
	}
}

export async function loader({ request }: DataFunctionArgs) {
	const userId = await getUserId(request)

	const or: StoryWhereInput[] = [
		{
			isPublic: true,
		},
	]

	if (userId) {
		or.push({
			ownerId: userId,
		})
	}

	const storySelect = {
		id: true,
		title: true,
		description: true,
		createdAt: true,
		owner: {
			select: {
				username: true,
			},
		},
	}
	const stories = await prisma.story.findMany({
		where: { OR: or },
		select: storySelect,
	})

	const privateStories = userId
		? await prisma.storyMember.findMany({
				where: {
					userId: userId,
				},
				select: {
					permission: {
						select: { name: true },
					},
					story: {
						select: storySelect,
					},
				},
		  })
		: []

	return json({
		stories: [
			...stories,
			...privateStories.map(({ story, permission }) => ({
				...story,
				permission,
			})),
		],
	})
}

export default function GetStoriesRoute() {
	const { stories } = useLoaderData<{ stories: StoryWithPermission[] }>()

	return (
		<main className="mx-auto h-full max-w-7xl px-8 py-8 md:rounded">
			<h1 className="mb-8 text-h1">Stories</h1>
			<ul>
				{stories.map(story => {
					return (
						<li key={story.id}>
							<div className="flex w-fit items-center gap-4">
								<h2 className="text-body-md font-bold underline">
									<Link to={`/stories/${story.id}/introduction`}>
										{story.title}
									</Link>
								</h2>
								{story.permission?.name === StoryPermissions.EditStory && (
									<Badge color="success">Editor</Badge>
								)}
								{story.permission?.name === StoryPermissions.ReadStory && (
									<Badge>Reader</Badge>
								)}
							</div>
							<p>{story.description}</p>
							<p className="text-md md:text-md mb-6 text-neutral-400">
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
	)
}
