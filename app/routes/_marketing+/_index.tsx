import type { MetaFunction } from '@remix-run/node'
import { owl } from './logos/logos.ts'
import {
	step1,
	step2,
	step3,
	step4,
	step5,
} from '~/routes/_marketing+/images/images.ts'
import React from 'react'

export const meta: MetaFunction = () => [
	{ title: 'Choose Your Own Adventure!' },
]

type TutorialStepProps = {
	index: number
	instructions: string
	imgSrc: string
	alt: string
}

function TutorialStep({ index, instructions, imgSrc, alt }: TutorialStepProps) {
	return (
		<li className="border-b lg:flex">
			<h3 className="lg:w-1/2">
				<b>Step {index}:</b> {instructions}
			</h3>
			<img src={imgSrc} alt={alt} width={600} />
		</li>
	)
}

export default function Index() {
	return (
		<main className="relative min-h-screen sm:items-center sm:justify-center">
			<div className="relative sm:pt-12">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="space-y-4 text-center">
						<h1 className="text-h1">The world's largest MMO-CCYOAG</h1>
						<div className="flex justify-center gap-2 text-2xl">
							<p className="first-letter:underline">Massive</p>
							<p className="first-letter:underline">Multiplayer</p>
							<p className="first-letter:underline">Online</p>
							<p className="first-letter:underline">Collaborative</p>
							<p className="first-letter:underline">Choose</p>
							<p className="first-letter:underline">Your</p>
							<p className="first-letter:underline">Own</p>
							<p className="first-letter:underline">Adventure</p>
							<p className="first-letter:underline">Game</p>
						</div>
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
								className="mx-auto mt-8 w-full max-w-[10rem] lg:max-w-[14rem]"
							/>
						</a>
					</div>
					<div className="py-16 text-center">
						<h2 className="text-2xl">
							Once you make an{' '}
							<a className="text-accent-purple underline" href="/signup">
								account,
							</a>{' '}
							getting{' '}
							<a className="text-accent-purple underline" href="/stories/new">
								started
							</a>{' '}
							is easy
						</h2>
					</div>
					<div className="flex justify-center gap-8 text-body-md">
						<ul className="space-y-10">
							<TutorialStep
								index={1}
								instructions='Click "Write a Story," then enter the title of your story and brief description of what the story will be about.'
								alt='Screenshot of the "New Story" screen with "The Ancient Forest" as the title and a description of the story.'
								imgSrc={step1}
							/>
							<TutorialStep
								index={2}
								instructions='Click "Write the first page" to enter the first page of your story.'
								imgSrc={step2}
								alt='Screenshot of the "Story Introduction" screen with the information from the previous step saved. There are the buttons: "Write the first page," "Edit," and "Settings"'
							/>
							<TutorialStep
								index={3}
								instructions='Write the first page of the story and click "Save."'
								imgSrc={step3}
								alt='Screenshot of the "New Page" screen with text describing the first page of a fantasy story that ends with a question to prompt the reader.'
							/>
							<TutorialStep
								index={4}
								instructions="Enter the choices readers can next."
								imgSrc={step4}
								alt='Screenshot of the "Page Edit" screen with the text from the first page followed by the title "Your choices are:" followed by choices that the reder might select such "Wander through the forest. The trees are so beautiful." and "Curl into a ball and cry."'
							/>
							<TutorialStep
								index={5}
								instructions="Click one of the choices to continue the story, and repeat!"
								imgSrc={step5}
								alt='Screenshot of the "New Page" screen, however at the top of the page, the previous page text and the selected choice "Wander through the forest. The trees are so beautiful." are displayed in a collasible accordion component.'
							/>
						</ul>
					</div>
				</div>
			</div>
		</main>
	)
}
