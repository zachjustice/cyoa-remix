import type { MetaFunction } from '@remix-run/node'
import React, { type ReactNode } from 'react'
import { ButtonLink } from '~/utils/forms.tsx'
import { PiPencilCircle } from 'react-icons/pi/index.js'
import { GiBookmarklet } from 'react-icons/gi/index.js'
import { step2 } from '~/routes/_marketing+/images/images.ts'
import { TbBooks } from 'react-icons/tb/index.js'
import { HaveAnAccount } from '~/components/HaveAnAccount.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Choose Your Own Adventure!' },
]

function Blurb({
	Icon,
	title,
	desc,
}: {
	Icon: ReactNode
	title: string
	desc: string
}) {
	return (
		<div className="flex flex-col text-center">
			<div className="mx-auto text-6xl">{Icon}</div>
			<h3 className="text-h4">{title}</h3>
			<p>{desc}</p>
		</div>
	)
}

export default function Index() {
	return (
		<main className="relative min-h-screen sm:items-center sm:justify-center">
			<div className="relative sm:pt-12">
				<div className="mx-auto max-w-3xl space-y-8 px-5 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="pt-8 text-h3">
							Collaborative Choose Your Own Adventure Stories
						</h1>
						<p className="pt-10 text-xl">
							Write your own story or create together with friends.
						</p>
					</div>
					<div className="pt-8 text-center">
						<ButtonLink className="mx-auto w-40" to="/signup" color="primary">
							Start for Free
						</ButtonLink>
					</div>
					<div className="flex items-center justify-center gap-2">
						<HaveAnAccount />
					</div>
					<div className="flex flex-col justify-center gap-8 py-5 text-body-md">
						<img
							className="border-2"
							src={step2}
							alt='The "New Story" page of this application.'
						/>
					</div>
					<div className="flex flex-col justify-center gap-8 py-5 text-body-md">
						<Blurb
							Icon={<GiBookmarklet />}
							title={'Choose your own adventure'}
							desc={
								'Stories are composed of pages followed by a list of choices. Click a choice to advance to the next page.'
							}
						/>
						<Blurb
							Icon={<PiPencilCircle />}
							title={'Private by Default'}
							desc={
								'Stories are private until you are ready to share. Easily invite friends as "editors" or "readers."'
							}
						/>
						<Blurb
							Icon={<TbBooks />}
							title={'Still in Beta'}
							desc={
								'This application is still in development! You may encounter some rough edges.'
							}
						/>
					</div>
				</div>
			</div>
		</main>
	)
}
