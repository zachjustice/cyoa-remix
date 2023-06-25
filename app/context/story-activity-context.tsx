import React, { createContext, useContext, useReducer } from 'react'
import {
	type ViewedChoice,
	type ViewedPage,
} from '~/routes/stories+/$storyId.pages.$pageId.tsx'

export type CurrentStory = {
	id: string
	title: string
	firstPageId: string | null
	description: string
	createdAt: string
	updatedAt: string
	ownerId: string
	owner: {
		id: string
		username: string
	}
}

export function isCurrentStory(
	currentStory: any,
): currentStory is CurrentStory {
	return (
		currentStory &&
		typeof currentStory === 'object' &&
		typeof currentStory.id === 'string'
	)
}

export interface StoryActivityChoice extends ViewedChoice {
	isChosen?: Boolean | undefined
}

export interface StoryActivityPage extends Omit<ViewedPage, 'nextChoices'> {
	nextChoices: StoryActivityChoice[]
}

type StoryActivityState = {
	currentStory: CurrentStory | null
	pageHistory: StoryActivityPage[]
}

const initialState: StoryActivityState = {
	currentStory: null,
	pageHistory: [],
}

const StoryActivityContext = createContext<StoryActivityState>(initialState)
const StoryDispatchContext = createContext<React.Dispatch<ActionType>>(
	() => undefined,
)

export function StoryActivityProvider({ children }: React.PropsWithChildren) {
	const [storyActivity, dispatch] = useReducer(
		storyActivityReducer,
		initialState,
	)

	return (
		<StoryActivityContext.Provider value={storyActivity}>
			<StoryDispatchContext.Provider value={dispatch}>
				{children}
			</StoryDispatchContext.Provider>
		</StoryActivityContext.Provider>
	)
}

export function useOptionalCurrentStory(): CurrentStory | null {
	const maybeCurrentStory = useContext(StoryActivityContext).currentStory

	return maybeCurrentStory
		? (JSON.parse(JSON.stringify(maybeCurrentStory)) as CurrentStory)
		: null
}

export function useCurrentStory() {
	const maybeStory = useOptionalCurrentStory()
	if (!maybeStory) {
		throw Error(
			'No current story set in StoryActivityContext, but story is required by useCurrentStory. If a current story is optional, try useOptionalCurrentStory instead.',
		)
	}
	return maybeStory
}

export function usePageHistory(): StoryActivityPage[] {
	return [...useContext(StoryActivityContext).pageHistory]
}

export function useStoryActivityDispatch() {
	return useContext(StoryDispatchContext)
}

type ActionType =
	| { type: 'reset-history'; payload?: null }
	| { type: 'view-story'; payload: CurrentStory }
	| { type: 'view-page'; payload: StoryActivityPage }
	| { type: 'make-choice'; payload: { pageId: string; choiceId: string } }

function storyActivityReducer(
	storyActivity: StoryActivityState,
	action: ActionType,
): StoryActivityState {
	switch (action.type) {
		case 'reset-history': {
			return {
				pageHistory: [],
				currentStory: null,
			}
		}
		case 'view-story': {
			return {
				pageHistory: [],
				currentStory: action.payload,
			}
		}
		case 'view-page': {
			// TODO is there a cleaner where to dispatch actions to manage this?
			// users should see past and current page in the sidebar
			// clicking a page in the sidebar should be a no-op
			// maybe beginning a story and making a choice (kinda the same thing)
			// mutate page history. then don't need this action really
			let isInPageHistory = !!storyActivity.pageHistory.find(
				page => page.id === action.payload.id,
			)

			return isInPageHistory
				? storyActivity
				: {
						...storyActivity,
						pageHistory: storyActivity.pageHistory.concat(action.payload),
				  }
		}
		case 'make-choice': {
			let pastPageIndex = storyActivity.pageHistory.findIndex(
				page => page.id === action.payload.pageId,
			)

			pastPageIndex =
				pastPageIndex > -1 ? pastPageIndex : storyActivity.pageHistory.length
			console.log(`## make choice: ${pastPageIndex}`)

			return {
				...storyActivity,
				pageHistory: storyActivity.pageHistory
					.slice(0, pastPageIndex + 1)
					.map(page => {
						page.id === action.payload.pageId &&
							console.log(
								`## make choice: ${action.payload.choiceId} ${JSON.stringify(
									page,
									null,
									2,
								)}`,
							)
						return page.id === action.payload.pageId
							? {
									...page,
									nextChoices: page.nextChoices.map(nextChoice => ({
										...nextChoice,
										isChosen: action.payload.choiceId === nextChoice.id,
									})),
							  }
							: page
					}),
			}
		}
		default: {
			throw Error(
				`Unknown action in StoryActivityReducer: ${JSON.stringify(action)}`,
			)
		}
	}
}
