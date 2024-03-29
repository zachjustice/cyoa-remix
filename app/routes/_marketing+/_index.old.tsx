import type { MetaFunction } from '@remix-run/node'
import { type ReactNode } from 'react'
import { clouds, owl } from './logos/logos.ts'
import { ButtonLink } from '~/utils/forms.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { type User } from '@prisma/client'

export const meta: MetaFunction = () => [
	{ title: 'Choose Your Own Adventure!' },
]

function StorySnippet({ children }: { children: ReactNode }) {
	return (
		<div className="w-80 flex-none last:pr-8">
			<div className="flex w-full items-center justify-center rounded-lg bg-indigo-400 p-4 italic shadow-lg drop-shadow-sm">
				{children}
			</div>
		</div>
	)
}

export default function Index() {
	const { user } = useMatchesData('/') as {
		user: User
	}
	return (
		<main className="relative min-h-screen sm:items-center sm:justify-center">
			<div className="relative sm:pb-16 sm:pt-8">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
						<div className="absolute inset-0">
							<img className="h-full w-full object-cover" src={clouds} alt="" />
							<div className="absolute inset-0 bg-[color:rgba(30,23,38,0.5)] mix-blend-multiply" />
						</div>
						<div className="relative px-4 pb-8 pt-8 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:py-40">
							<h1 className="text-center text-2xl font-extrabold tracking-tight sm:text-2xl lg:text-2xl">
								<a href="/stories">Choose Your Own Adventure!</a>
							</h1>
							<div className="mx-auto mt-6 max-w-lg text-center text-xl text-color-primary sm:max-w-3xl">
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
								{/* TODO better custom logo */}
								<img
									src={owl}
									alt="Illustration of a pixel art owl"
									className="mx-auto mt-8 w-full max-w-[12rem] md:max-w-[16rem]"
								/>
							</a>

							<div className="relative rounded-xl p-8">
								<div className="flex flex-wrap justify-center gap-4 rounded-lg">
									{!user && (
										<>
											<ButtonLink to="/signup" color="primary">
												Sign Up
											</ButtonLink>
											<ButtonLink to="/login">Log In</ButtonLink>
										</>
									)}
									<ButtonLink to="/stories">Browse Stories</ButtonLink>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="relative mx-auto max-w-7xl rounded-xl p-8 sm:px-6 lg:px-8">
					<div className="flex flex-nowrap gap-4 overflow-auto  rounded-lg bg-gray-100 p-6 leading-6 text-color-primary lg:items-center lg:justify-center">
						<StorySnippet>
							You wake up and find yourself in the middle of a large forest.
							Ancient trees stand all around you. The forest is quiet except for
							the sound of the wind through the leaves and the occasional bird
							song. Why can't you remember anything? And why are you holding a
							bloody knife...
						</StorySnippet>
						<StorySnippet>
							After years of training you stand before the wizard, Gharkelzard.
							This ancient and wizened eyes speak of untold power and mystery.
							Eager young wizards have given their whole lives for the
							opportunity to stand where you are today, but you have not come
							here to learn but for revenge...
						</StorySnippet>
						<StorySnippet>
							The rats crawl up from the sewers- putrid, hungry, seeking. You
							lay out the poison in all the dark places they hunt. Their filth
							penetrates every fiber of clothing and hair follicle no matter how
							much you wash yourself until one day you find gleaming in the
							darkness...
						</StorySnippet>
					</div>
				</div>
			</div>
		</main>
	)
}
