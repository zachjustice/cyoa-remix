import { type DataFunctionArgs, json } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { clsx } from 'clsx'
import { useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import { usePageHistory } from '~/context/story-activity-context.tsx'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'

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
	const { story, isOwner } = useLoaderData<typeof loader>()
	const pageHistory = usePageHistory()
	const location = useLocation()

	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-500 pl-2 md:container md:rounded">
				<div className="col-span-1 py-6">
					<h1 className="mb-2 ml-8 text-h2">{story.title}</h1>
					<p className="mb-1 ml-8">Table of Contents</p>
					<ul>
						{location.pathname.includes('/pages/new') && (
							<li>
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
							</li>
						)}
						{pageHistory.reverse().map((page, index) => {
							return (
								<li key={page.id}>
									<NavLink
										to={`/stories/${story.id}/pages/${page.id}`}
										className={({ isActive }) =>
											clsx(navLinkDefaultClassName, {
												'bg-night-400': isActive,
											})
										}
									>
										Page {pageHistory.length - index}
									</NavLink>
								</li>
							)
						})}
						<li>
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
						</li>
					</ul>
				</div>
				<main className="col-span-3 bg-night-400 px-10 py-12 md:rounded">
					<div className="mb-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
