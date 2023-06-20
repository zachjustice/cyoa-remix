import type { V2_MetaFunction } from '@remix-run/node'
import { ButtonLink } from '~/utils/forms.tsx'
import { kodyRocket, logos, stars } from './logos/logos.ts'

export const meta: V2_MetaFunction = () => [
	{ title: 'Choose Your Own Adventure!' },
]

export default function Index() {
	return (
		<main className="relative min-h-screen sm:flex sm:items-center sm:justify-center">
			<div className="relative sm:pb-16 sm:pt-8">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
						<div className="absolute inset-0">
							<img className="h-full w-full object-cover" src={stars} alt="" />
							<div className="absolute inset-0 bg-[color:rgba(30,23,38,0.5)] mix-blend-multiply" />
						</div>
						<div className="lg:pt-18 relative px-4 pb-8 pt-8 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pb-20">
							<h1 className="text-center text-2xl font-extrabold tracking-tight sm:text-2xl lg:text-2xl">
								<a href="/stories">Choose Your Own Adventure!</a>
							</h1>
							<div className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
								<p>
									Explore collaborative{' '}
									<a className="underline" href="/stories">
										choose-your-own-adventure stories
									</a>{' '}
									from every genre.
								</p>
								<p>Start your own or contribute to a story you love!</p>
							</div>
							<a href="/stories">
								{/* TODO get custom logo or something */}
								<img
									src={kodyRocket}
									alt="Illustration of a Koala riding a rocket"
									className="mx-auto mt-8 w-full max-w-[12rem] md:max-w-[16rem]"
								/>
							</a>
							<div className="flex justify-center gap-10">
								<ButtonLink to="/sign-up" size="sm" variant="primary">
									Sign Up
								</ButtonLink>
								<ButtonLink to="/login" size="sm" variant="secondary">
									Log In
								</ButtonLink>
								<ButtonLink to="/stories" size="sm" variant="secondary">
									Browse Stories
								</ButtonLink>
							</div>
						</div>
					</div>
				</div>

				<div className="mx-auto mt-8 max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
					<div className="flex flex-wrap justify-center gap-8 rounded-3xl bg-day-300 py-4">
						{/* TODO auto scroll through randomly selected stories so users can see what has been written before */}
						{logos.map(img => (
							<a
								key={img.href}
								href={img.href}
								className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
							></a>
						))}
					</div>
				</div>
			</div>
		</main>
	)
}
