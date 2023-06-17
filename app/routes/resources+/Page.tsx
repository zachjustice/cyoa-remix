import {Link, NavLink} from "@remix-run/react";
import {clsx} from "clsx";
import React, {useState} from "react";
import {useStoryActivityDispatch} from "~/context/StoryActivityContext.tsx";
import {ChoiceEditor} from "~/routes/resources+/choice-editor.tsx";
import {ViewedPage} from "~/routes/stories+/$storyId_+/pages+/$pageId.tsx";
import styles from './Page.module.css'

type PageProps = {
    page: ViewedPage, //{nextChoices: Choice[]} extends Page,
    storyId: string,
    editable: boolean
}

export function PageViewer({page, storyId, editable = false}: PageProps) {
    const dispatch = useStoryActivityDispatch()
    console.log(`## PageViewer storyId ${storyId}`)
    const [activeChoice, setActiveChoice] = useState();

    return (<div>
        <p className='mb-5'>{page.content}</p>
        <ul key={page.id}>
            {page.nextChoices.map((choice) => {
                let link = choice.nextPageId
                    ? `/stories/${storyId}/pages/${choice.nextPageId}`
                    : `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`;
                return (
                    <li key={choice.id}>
                        <Link to={link}
                              className={styles.selectedField}
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
            })}
            {editable && (page.nextChoices.length < 4)
                && <ChoiceEditor choice={{
                    parentPageId: page.id,
                    storyId: storyId
                }}/>}
        </ul>
    </div>)
}