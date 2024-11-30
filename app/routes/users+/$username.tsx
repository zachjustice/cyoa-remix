import { json, type DataFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { Spacer } from '~/components/spacer.tsx'
import { prisma } from '~/utils/db.server.ts'
import { ButtonLink } from '~/utils/forms.tsx'
import { getUserImgSrc } from '~/utils/misc.ts'
import { useOptionalUser } from '~/hooks/useUser.ts'
import { Simulate } from 'react-dom/test-utils'
import submit = Simulate.submit

export async function loader({ params }: DataFunctionArgs) {
	invariant(params.username, 'Missing username')
	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
			createdAt: true,
		},
	})
	if (!user) {
		throw new Response('not found', { status: 404 })
	}
	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function UsernameIndex() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.name ?? user.username
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id

	return (
		<div className="container mx-auto mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container mx-auto flex flex-col items-center rounded-xl bg-night-500 p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(data.user.imageId)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{userDisplayName}</h1>
					</div>
					<p className="mt-2 text-center text-color-subtitle">
						Joined {data.userJoinedDisplay}
					</p>
					<div className="mt-10 space-y-4 ">
						{isLoggedInUser && (
							<>
								<ButtonLink
									to="/settings/profile"
									color="secondary"
									size="md"
									prefetch="intent"
								>
									Edit profile
								</ButtonLink>

								<Form
									action="/logout"
									method="POST"
									className="active:border-accent-primary-lighter group relative flex items-center justify-center rounded-lg border-night-400 bg-accent-alert p-0.5 text-center font-medium hover:border-accent-primary hover:bg-gray-100 focus:z-10 focus:border-accent-primary focus:bg-gray-100 focus:outline-none focus:ring-2 active:bg-gray-100 dark:hover:bg-night-700 dark:hover:text-color-primary"
									onClick={e => submit(e.currentTarget)}
								>
									<button
										className="flex items-center rounded-md px-3 py-1.5 text-sm transition-all duration-200"
										type="submit"
									>
										Logout
									</button>
								</Form>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [
		{ title: `${displayName} | Choose Your Own Adventure!` },
		{
			name: 'description',
			content: `${displayName} on Choose Your Own Adventure! is not a host or renter yet.`,
		},
	]
}
