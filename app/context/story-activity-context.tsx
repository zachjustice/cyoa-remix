import React, { createContext, useContext, useReducer } from 'react'
import {
	type ViewedChoice,
	type ViewedPage,
} from '~/routes/stories+/$storyId.pages.$pageId.tsx'
import * as toolkitRaw from '@reduxjs/toolkit'
const { createSlice } = ((toolkitRaw as any).default ??
	toolkitRaw) as typeof toolkitRaw

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

const STORY_ACTIVITY_LOCAL_STORAGE_KEY = 'story-activity'

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

const emptyState: StoryActivityState = {
	currentStory: null,
	pageHistory: [],
}

export function usePageHistory(): StoryActivityPage[] {
	return useContext(StoryActivityContext).pageHistory
}

export function useStoryActivityDispatch() {
	return useContext(StoryDispatchContext)
}

const storyActivitySlice = createSlice({
	name: 'story-activity',
	reducers: {
		resetHistory: (state, action) => {
			state.pageHistory = []
			state.currentStory = null
		},
		viewedStory: (state, action) => {
			state.pageHistory = []
			state.currentStory = action.payload
		},
		viewedPage: (state, action) => {
			const isInPageHistory = !!state.pageHistory.find(
				page => page.id === action.payload.id,
			)

			state.pageHistory = isInPageHistory
				? state.pageHistory
				: state.pageHistory.concat(action.payload)
		},
		madeChoice: (state, action) => {
			let pastPageIndex = state.pageHistory.findIndex(
				page => page.id === action.payload.pageId,
			)

			pastPageIndex =
				pastPageIndex > -1 ? pastPageIndex : state.pageHistory.length

			state.pageHistory = state.pageHistory
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
				})
		},
	},
	initialState: emptyState,
})

export const { viewedPage, viewedStory, resetHistory, madeChoice } =
	storyActivitySlice.actions

type ActionType =
	| { type: 'resetHistory'; payload?: null }
	| { type: 'viewedStory'; payload: CurrentStory }
	| { type: 'viewedPage'; payload: StoryActivityPage }
	| { type: 'madeChoice'; payload: { pageId: string; choiceId: string } }

const StoryActivityContext = createContext<StoryActivityState>(
	storyActivitySlice.getInitialState(),
)
const StoryDispatchContext = createContext<React.Dispatch<ActionType>>(
	() => undefined,
)

export function StoryActivityProvider({ children }: React.PropsWithChildren) {
	let initialState: StoryActivityState
	// try {
	//     initialState =
	//         (JSON.parse(
	//             localStorage?.getItem(STORY_ACTIVITY_LOCAL_STORAGE_KEY) || 'null',
	//         ) as StoryActivityState) || emptyState
	// } catch (e) {
	initialState = emptyState
	// }

	const [storyActivity, dispatch] = useReducer(
		storyActivitySlice.reducer,
		storyActivitySlice.getInitialState(),
	)

	// useEffect(() => {
	//     if (window) {
	//         localStorage?.setItem(
	//             STORY_ACTIVITY_LOCAL_STORAGE_KEY,
	//             JSON.stringify(storyActivity),
	//         )
	//     }
	// }, [storyActivity])

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
