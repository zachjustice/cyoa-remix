import type { MetaFunction } from '@remix-run/node'
import { demo, owl } from './logos/logos.ts'

export const meta: MetaFunction = () => [
	{ title: 'Choose Your Own Adventure!' },
]

export default function Index() {
	return (
		<main className="relative min-h-screen sm:items-center sm:justify-center">
			<div className="relative sm:pt-12">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="space-y-4 text-center">
						<h1 className="text-h1">The world's largest MMO-CCYOAG</h1>
						<p className="flex justify-center gap-2 text-2xl">
							<p className="first-letter:underline">Massive</p>
							<p className="first-letter:underline">Multiplayer</p>
							<p className="first-letter:underline">Online</p>
							<p className="first-letter:underline">Collaborative</p>
							<p className="first-letter:underline">Choose</p>
							<p className="first-letter:underline">Your</p>
							<p className="first-letter:underline">Own</p>
							<p className="first-letter:underline">Adventure</p>
							<p className="first-letter:underline">Game</p>
						</p>
						<p className="text-2xl">
							Explore collaborative{' '}
							<a className="text-accent-purple underline" href="/stories">
								choose-your-own-adventure stories
							</a>{' '}
							from every genre.
						</p>
						<a href="/stories">
							{/* TODO better custom logo */}
							<img
								src={owl}
								alt="Illustration of a pixel art owl"
								className="mx-auto mt-8 w-full max-w-[10rem] md:max-w-[14rem]"
							/>
						</a>
					</div>
					<div className="pb-4 pt-16 text-center">
						<h2 className="text-h2">
							<a href="/stories" className="text-2xl">
								Getting{' '}
								<a className="text-accent-purple underline" href="/stories/new">
									started
								</a>{' '}
								is easy
							</a>
						</h2>
					</div>
					<div className="flex justify-center gap-8">
						<div className="w-[250px]">
							<img
								alt="A screen recording demoing the functionality of this website."
								src={demo}
								width={504}
								height={1064}
							/>
						</div>
						<ul className="space-y-10">
							<li>
								<h3 className="text-2xl">
									<b>Step 1:</b> Create a new story
								</h3>
							</li>
							<li>
								<h3 className="text-2xl">
									<b>Step 2:</b> Write the first page
								</h3>
							</li>
							<li>
								<h3 className="text-2xl">
									<b>Step 3:</b> Repeat!
								</h3>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</main>
	)
}
