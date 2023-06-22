import React from 'react'
import { Outlet } from '@remix-run/react'

export default function StoryNavigator({ children }) {
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-500 pl-2 md:container md:rounded">
				<div className="col-span-1 py-6">{children}</div>
				<main className="col-span-3 bg-night-400 px-10 py-12 md:rounded">
					<div className="mb-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
