import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'
import { clsx } from 'clsx'
import { getUserImgSrc } from '~/utils/misc.ts'
import invariant from 'tiny-invariant'

export async function loader({ params, request }: DataFunctionArgs) {
	invariant(params.username, 'Missing username')

	const owner = await prisma.user.findUnique({
		where: {
			username: params.username,
		},
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
		},
	})

	if (!owner) {
		throw new Response('Not found', { status: 404 })
	}

	const stories = await prisma.story.findMany({
		where: {
			ownerId: owner.id,
		},
		select: {
			id: true,
			title: true,
			description: true,
		},
	})
	return json({ owner, stories })
}

export default function StoriesRoute() {
	const data = useLoaderData<typeof loader>()
	const ownerDisplayName = data.owner.name ?? data.owner.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-500 pl-2 md:container md:rounded-3xl">
				<div className="col-span-1 py-12">
					<Link
						to={`/users/${data.owner.username}`}
						className="mb-4 flex flex-col items-center justify-center gap-2 pl-8 pr-4 lg:flex-row lg:justify-start lg:gap-4"
					>
						<img
							src={getUserImgSrc(data.owner.imageId)}
							alt={ownerDisplayName}
							className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
						/>
						<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
							{ownerDisplayName}'s Stories
						</h1>
					</Link>
					<ul>
						{/* TODO check if user is owner */}
						{/*<li>*/}
						{/*    <NavLink*/}
						{/*        to="new"*/}
						{/*        className={({isActive}) =>*/}
						{/*            clsx(navLinkDefaultClassName, {*/}
						{/*                'bg-night-400': isActive,*/}
						{/*            })*/}
						{/*        }*/}
						{/*    >*/}
						{/*        + New Note*/}
						{/*    </NavLink>*/}
						{/*</li>*/}
						<li>
							<NavLink
								to="new"
								className={({ isActive }) =>
									clsx(navLinkDefaultClassName, {
										'bg-night-400': isActive,
									})
								}
							>
								+ New Story
							</NavLink>
						</li>
						{data.stories.map(story => (
							<li key={story.id}>
								<NavLink
									to={`/stories/${story.id}/introduction`}
									className={({ isActive }) =>
										clsx(navLinkDefaultClassName, {
											'bg-night-400': isActive,
										})
									}
								>
									{story.title}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
				<main className="col-span-3 bg-night-400 px-10 py-12 md:rounded-r-3xl">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
