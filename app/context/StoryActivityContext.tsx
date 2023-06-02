import {type Page} from "@prisma/client";
import React, {createContext, useContext, useReducer} from 'react';

export type CurrentStory = {
    id: string,
    title: string,
    firstPageId: string|null,
    description: string,
    createdAt: string,
    updatedAt: string,
    ownerId: string,
    owner: {
        select: {
            id: string,
            username: string,
        }
    }
}

export function isCurrentStory(currentStory: any): currentStory is CurrentStory {
    return currentStory && typeof currentStory === 'object' && typeof currentStory.id === 'string'
}

type StoryActivityState = {
    currentStory: CurrentStory | null,
    pageHistory: Page[]
}

const initialState: StoryActivityState = {
    currentStory: null,
    pageHistory: []
}

const StoryActivityContext = createContext<StoryActivityState>(initialState);
const StoryDispatchContext = createContext<React.Dispatch<ActionType>>(() => undefined);

export function StoryActivityProvider({children}: React.PropsWithChildren) {
    const [storyActivity, dispatch] = useReducer(storyActivityReducer, initialState);

    return (
        <StoryActivityContext.Provider value={storyActivity}>
                <StoryDispatchContext.Provider value={dispatch}>
                    {children}
                </StoryDispatchContext.Provider>
        </StoryActivityContext.Provider>
    );
}

export function useOptionalCurrentStory(): CurrentStory|null {
    const maybeCurrentStory = useContext(StoryActivityContext).currentStory;

    return maybeCurrentStory
        ? JSON.parse(JSON.stringify(maybeCurrentStory)) as CurrentStory
        : null;
}

export function useCurrentStory() {
    const maybeStory = useOptionalCurrentStory();
    if (!maybeStory) {
        throw Error('No current story set in StoryActivityContext, but story is required by useCurrentStory. If a current story is optional, try useOptionalCurrentStory instead.')
    }
    return maybeStory
}

export function usePageHistory(): Page[] {
    return [...useContext(StoryActivityContext).pageHistory];
}

export function useStoryActivityDispatch() {
    return useContext(StoryDispatchContext);
}

type ActionType =
    | { type: 'reset-story-activity' , payload: null }
    | { type: 'begin-story' , payload: CurrentStory }
    | { type: 'add-to-page-history', payload: Page };


function storyActivityReducer(storyActivity: StoryActivityState, action: ActionType): StoryActivityState {
    console.log(`## storyReducer(${storyActivity}, ${JSON.stringify(action)})`)
    switch (action.type) {
        case 'reset-story-activity': {
            return {
                pageHistory: [],
                currentStory: null,
            };
        }
        case 'begin-story': {
            return {
                pageHistory: [],
                currentStory: action.payload,
            };
        }
        case 'add-to-page-history': {
            return {
                ...storyActivity,
                pageHistory: storyActivity.pageHistory.concat(action.payload),
            };
        }
        default: {
            throw Error(`Unknown action in StoryActivityReducer: ${JSON.stringify(action)}`);
        }
    }
}
