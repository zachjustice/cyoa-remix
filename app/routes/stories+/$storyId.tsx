import { type DataFunctionArgs, json } from '@remix-run/node'
import {
	NavLink,
	Outlet,
	useLoaderData,
	useLocation,
	useSearchParams,
} from '@remix-run/react'
import { clsx } from 'clsx'
import invariant from 'tiny-invariant'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import {
	deletedPage,
	usePageHistory,
	useStoryActivityDispatch,
} from '~/context/story-activity-context.tsx'
import Sidebar from '~/components/Sidebar.tsx'
import { StoryPermissions } from '~/routes/stories+/$storyId.settings.tsx'
import { requireStoryReader } from '~/utils/permissions.server.ts'
import { commitSession, getSession } from '~/utils/session.server.ts'
import { deletedPageSessionKey } from '~/routes/stories+/$storyId.pages.$pageId_.delete.tsx'
import { useEffect } from 'react'

export async function loader({ params, request }: DataFunctionArgs) {
	invariant(params.storyId, 'Missing storyId')

	const userId = await getUserId(request)

	const story = await prisma.story.findUnique({
		where: { id: params.storyId },
		select: {
			id: true,
			title: true,
			firstPageId: true,
			description: true,
			createdAt: true,
			updatedAt: true,
			isPublic: true,
			ownerId: true,
			owner: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	})

	if (!story) {
		throw new Response('not found', { status: 404 })
	}

	if (!story.isPublic && story.owner.id !== userId) {
		await requireStoryReader(params.storyId, userId)
	}

	let permissions
	if (userId) {
		permissions = await prisma.storyMember.findFirst({
			where: {
				storyId: params.storyId,
				userId: userId,
			},
			select: {
				permission: {
					select: {
						name: true,
					},
				},
			},
		})
	}
	const session = await getSession(request.headers.get('cookie'))
	const deletedPageId = session.get(deletedPageSessionKey)
	session.unset(deletedPageSessionKey)

	return json(
		{
			story,
			deletedPageId,

			canEditPage:
				story.owner.id === userId ||
				permissions?.permission.name === StoryPermissions.EditStory,
			canEditChoice:
				story.owner.id === userId ||
				permissions?.permission.name === StoryPermissions.EditStory,
			canAddChoice:
				story.owner.id === userId ||
				permissions?.permission.name === StoryPermissions.EditStory,
			canAddPage:
				story.owner.id === userId ||
				permissions?.permission.name === StoryPermissions.EditStory,

			canEditStorySettings: story.owner.id === userId,
			canDeleteStory: story.owner.id === userId,
			canDeletePage: story.owner.id === userId,
			canDeleteChoice: story.owner.id === userId,
		},
		{
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		},
	)
}

export default function GetStoryRoute() {
	const [searchParams] = useSearchParams()
	const {
		story,
		canEditPage,
		canEditChoice,
		canAddChoice,
		canAddPage,
		deletedPageId,
	} = useLoaderData<typeof loader>()
	const pageHistory = usePageHistory()
	const location = useLocation()

	const editPage =
		canEditPage || canEditChoice || canAddChoice
			? !!searchParams.get('editPage')
			: false

	const dispatch = useStoryActivityDispatch()
	useEffect(() => {
		if (deletedPageId) {
			dispatch(deletedPage({ pageId: deletedPageId }))
		}
	}, [deletedPageId, dispatch])

	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l my-2 py-2 pl-8 pr-6 text-base lg:text-xl hover:bg-accent-secondary hover:text-color-primary-inverted'
	const isActiveClass = 'bg-accent-primary'
	return (
		<div className="relative flex h-fit min-h-full w-full">
			<main className="order-2 h-fit min-h-full w-full px-10 py-12 md:rounded">
				<p className="mb-4">
					<a href="/stories" className="italic">
						Home
					</a>
					{' > '}
					{story.title}
				</p>
				<Outlet />
			</main>
			<div className="order-1 flex grow">
				<Sidebar>
					<h1 className="mb-2 mr-2 text-h2">{story.title}</h1>
					<p className="mb-2 mr-2">Table of Contents</p>
					<Sidebar.ItemGroup>
						<NavLink
							to={`/stories/${story.id}/introduction`}
							className={({ isActive }) =>
								clsx(navLinkDefaultClassName, {
									[isActiveClass]: isActive,
								})
							}
						>
							Introduction
						</NavLink>
						{pageHistory.map((page, index) => {
							return (
								<NavLink
									key={`/stories/${story.id}/pages/${page.id}`}
									to={`/stories/${story.id}/pages/${page.id}${
										editPage ? '?editPage=true' : ''
									}`}
									className={({ isActive }) =>
										clsx(navLinkDefaultClassName, {
											[isActiveClass]: isActive,
										})
									}
								>
									Page {index + 1}
								</NavLink>
							)
						})}
						{location.pathname.includes('/pages/new') && (
							<NavLink
								to={`/stories/${story.id}/pages/new`}
								className={({ isActive }) =>
									clsx(navLinkDefaultClassName, {
										[isActiveClass]: isActive,
									})
								}
							>
								{canAddPage ? 'New Page' : 'The End'}
							</NavLink>
						)}
					</Sidebar.ItemGroup>
				</Sidebar>
			</div>
		</div>
	)
}
