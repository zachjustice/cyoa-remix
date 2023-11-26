import { type DataFunctionArgs, json } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData, useLocation } from '@remix-run/react'
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
	const { story } = useLoaderData<typeof loader>()
	const pageHistory = usePageHistory()
	const location = useLocation()
	console.log(
		`## GET STORY ROUTE PAGE HISTORY ${JSON.stringify(pageHistory, null, 2)}`,
	)

	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="flex">
			<main className="order-2 bg-night-400 px-10 py-12 md:rounded">
				<div className="mb-6">
					<Outlet />
				</div>
			</main>
			<div className="order-1">
				<Sidebar>
					<h1 className="mb-2 ml-8 text-h2">{story.title}</h1>
					<p className="mb-1 ml-8">Table of Contents</p>
					<Sidebar.ItemGroup>
						<Sidebar.Item>
							<NavLink
								to={`/stories/${story.id}/introduction`}
								className={({ isActive }) =>
									clsx(navLinkDefaultClassName, {
										'bg-night-400': isActive,
									})
								}
							>
								Introduction
							</NavLink>
						</Sidebar.Item>
						{pageHistory.map((page, index) => {
							return (
								<Sidebar.Item key={page.id}>
									<NavLink
										to={`/stories/${story.id}/pages/${page.id}`}
										className={({ isActive }) =>
											clsx(navLinkDefaultClassName, {
												'bg-night-400': isActive,
											})
										}
									>
										Page {index + 1}
									</NavLink>
								</Sidebar.Item>
							)
						})}
						{location.pathname.includes('/pages/new') && (
							<Sidebar.Item>
								<NavLink
									to={`/stories/${story.id}/pages/new`}
									className={({ isActive }) =>
										clsx(navLinkDefaultClassName, {
											'bg-night-400': isActive,
										})
									}
								>
									New Page
								</NavLink>
							</Sidebar.Item>
						)}
					</Sidebar.ItemGroup>
				</Sidebar>
			</div>
		</div>
	)
}
