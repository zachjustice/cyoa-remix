import React, { createContext, useContext, useReducer } from 'react'
import {
	type ViewedChoice,
	type ViewedPage,
} from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.tsx'

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

interface StoryActivityChoice extends ViewedChoice {
	isChosen: Boolean | undefined
}

interface StoryActivityPage extends Omit<ViewedPage, 'nextChoices'> {
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
	| { type: 'reset-story-activity'; payload: null }
	| { type: 'begin-story'; payload: CurrentStory }
	| { type: 'add-to-page-history'; payload: StoryActivityPage }

function storyActivityReducer(
	storyActivity: StoryActivityState,
	action: ActionType,
): StoryActivityState {
	switch (action.type) {
		case 'reset-story-activity': {
			return {
				pageHistory: [],
				currentStory: null,
			}
		}
		case 'begin-story': {
			return {
				pageHistory: [],
				currentStory: action.payload,
			}
		}
		case 'add-to-page-history': {
			let pastPageIndex = storyActivity.pageHistory.findIndex(
				page => page.id === action.payload.id,
			)

			pastPageIndex =
				pastPageIndex > -1 ? pastPageIndex : storyActivity.pageHistory.length

			return {
				...storyActivity,
				pageHistory: storyActivity.pageHistory
					.slice(0, pastPageIndex)
					.concat(action.payload),
			}
		}
		default: {
			throw Error(
				`Unknown action in StoryActivityReducer: ${JSON.stringify(action)}`,
			)
		}
	}
}
