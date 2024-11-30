import { type DataFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatPublishDate } from '~/utils/dateFormat.ts'
import { prisma } from '~/utils/db.server.ts'
import { getUserId } from '~/utils/auth.server.ts'
import { Badge, Tabs } from 'flowbite-react'
import { StoryPermissions } from '~/routes/stories+/$storyId.settings.tsx'
import { useOptionalUser, type UserView } from '~/hooks/useUser.ts'

type StoryWithPermission = {
	id: string
	title: string
	description: string
	createdAt: string
	isPublic: boolean
	owner: {
		username: string
	}
	permission?: {
		name: string
	}
}

export async function loader({ request }: DataFunctionArgs) {
	const userId = await getUserId(request)

	const storySelect = {
		id: true,
		title: true,
		description: true,
		createdAt: true,
		isPublic: true,
		owner: {
			select: {
				username: true,
			},
		},
	}

	const stories = await prisma.story.findMany({
		where: { isPublic: true },
		select: storySelect,
	})

	const storiesOwnedByUser = userId
		? await prisma.story.findMany({
				where: { ownerId: userId },
				select: storySelect,
		  })
		: []

	const storyMembers = userId
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

	const storiesReadingAndEditing = storyMembers.map(
		({ story, permission }) => ({
			...story,
			permission,
		}),
	)

	return json({
		stories: stories,
		storiesOwnedByUser: storiesOwnedByUser,
		storiesReadingAndEditing: storiesReadingAndEditing,
	})
}

type StoryListProps = {
	stories: StoryWithPermission[]
	user?: UserView
	children?: React.ReactNode
}

function StoryList({ stories, user, children }: StoryListProps) {
	if (stories?.length === 0) {
		return (
			<>
				<p>Nothing here yet.</p>
				{children && children}
				{!user && (
					<p>
						<a className="font-bold underline" href="/signup">
							Sign up
						</a>{' '}
						or{' '}
						<a className="font-bold underline" href="/login">
							log-in
						</a>{' '}
						if you already have an account
					</p>
				)}
			</>
		)
	}

	return (
		<ul>
			{stories?.map(story => {
				return (
					<li
						key={story.id}
						className="border-day-border border border-t-0 p-4 last:rounded-b dark:border-night-border"
					>
						<div className="flex w-fit items-center gap-4">
							<h2 className="text-md font-bold text-accent-primary">
								<Link
									to={`/stories/${story.id}/introduction`}
									className="hover:underline"
								>
									{story.title}
								</Link>
							</h2>
							{story.isPublic && <Badge color="dark">Public</Badge>}
							{!story.isPublic && <Badge color="dark">Private</Badge>}
							{story.owner.username === user?.username && (
								<Badge color="indigo">Owner</Badge>
							)}
							{story.permission?.name === StoryPermissions.EditStory && (
								<Badge color="success">Editor</Badge>
							)}
							{story.permission?.name === StoryPermissions.ReadStory && (
								<Badge>Reader</Badge>
							)}
						</div>
						<p className="text-day-subtitle dark:text-night-subtitle">
							{story.description}
						</p>
						<p className="text-md md:text-md text-day-subtitle dark:text-night-subtitle">
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
	)
}

type LoaderDataShape = {
	stories: StoryWithPermission[]
	storiesOwnedByUser: StoryWithPermission[]
	storiesReadingAndEditing: StoryWithPermission[]
}

export default function GetStoriesRoute() {
	const { stories, storiesOwnedByUser, storiesReadingAndEditing } =
		useLoaderData<LoaderDataShape>()
	const user = useOptionalUser()

	return (
		<main className="mx-auto h-full max-w-5xl px-4 py-8 sm:px-8">
			<h1 className="mb-2 text-h1">Stories</h1>
			{/* eslint-disable-next-line react/style-prop-object */}
			<Tabs style="pills">
				<Tabs.Item active title="Public Stories">
					<StoryList stories={stories} user={user} />
				</Tabs.Item>
				<Tabs.Item title="Your Stories">
					<StoryList stories={storiesOwnedByUser} user={user}>
						<p>
							When you write your own stories, those stories will show up here.
						</p>
					</StoryList>
				</Tabs.Item>
				<Tabs.Item title="Reading & Editing">
					<StoryList stories={storiesReadingAndEditing} user={user}>
						<p>
							When you write your own stories, those stories will show up here.
						</p>
					</StoryList>
				</Tabs.Item>
			</Tabs>
		</main>
	)
}
