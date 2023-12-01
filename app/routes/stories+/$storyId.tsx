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
import { usePageHistory } from '~/context/story-activity-context.tsx'
import Sidebar from '~/components/sidebar.tsx'

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
	return json({ story, isOwner: story.owner.id === userId })
}

export default function GetStoryRoute() {
	const [searchParams] = useSearchParams()
	const { story, isOwner } = useLoaderData<typeof loader>()
	const pageHistory = usePageHistory()
	const location = useLocation()

	const editPage = isOwner ? !!searchParams.get('editPage') : false

	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l my-2 py-2 pl-8 pr-6 text-base lg:text-xl hover:bg-accent-yellow hover:text-night-700'
	const isActiveClass = 'bg-accent-purple'
	return (
		<div className="relative flex h-full w-full">
			<main className="order-2 w-full px-10 py-12 md:rounded">
				<p className="mb-4">
					<a href="/stories" className="italic">
						Home
					</a>
					{' > '}
					<a href={`/users/${story.owner.username}`} className="italic">
						{story.owner.username}
					</a>
					{' > '}
					{story.title}
				</p>
				<Outlet />
			</main>
			<div className="order-1 h-full">
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
								New Page
							</NavLink>
						)}
					</Sidebar.ItemGroup>
				</Sidebar>
			</div>
		</div>
	)
}
