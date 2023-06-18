import {Link} from "@remix-run/react";
import React from "react";
import {useStoryActivityDispatch} from "~/context/story-activity-context.tsx";
import {ChoiceEditor} from "~/routes/resources+/choice-editor.tsx";
import {type ViewedPage} from "~/routes/stories+/$storyId+/pages+/$pageId.tsx";

type ChoiceListProps = {
    page: ViewedPage
    storyId: string
}

function ChoiceList({page, storyId}: ChoiceListProps) {
    const dispatch = useStoryActivityDispatch()

    return page.nextChoices.map((choice) => {
        let link = choice.nextPageId
            ? `/stories/${storyId}/pages/${choice.nextPageId}`
            : `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`;
        return (
            <li key={choice.id}>
                <Link to={link}
                      className="hover:text-neutral-400"
                      onClick={() => {
                          dispatch({
                              type: 'add-to-page-history',
                              payload: {
                                  ...page,
                                  nextChoices: page.nextChoices.map((nextChoice) => ({
                                      ...nextChoice,
                                      isChosen: choice.id === nextChoice.id
                                  }))
                              }
                          });
                      }}>
                    {choice.content}
                </Link>
            </li>
        )
    })
}

type PageProps = {
    page: ViewedPage, //{nextChoices: Choice[]} extends Page,
    storyId: string,
    editable: boolean
}

export function PageViewer({page, storyId, editable = false}: PageProps) {
    console.log(`## PageViewer storyId ${storyId}`)

    return (<div>
        <p className='mb-5'>{page.content}</p>
        <ul key={page.id}>
            {...ChoiceList({page, storyId})}
            {editable && (page.nextChoices.length < 4)
                && <ChoiceEditor choice={{
                    parentPageId: page.id,
                    storyId: storyId
                }}/>}
        </ul>
    </div>)
}