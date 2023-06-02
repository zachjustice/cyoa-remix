import {Link} from "@remix-run/react";
import {ChoiceEditor} from "~/routes/resources+/choice-editor.tsx";
import type {Choice, Page} from '@prisma/client'

type PageProps = {
    page: any, //{nextChoices: Choice[]} extends Page,
    storyId: string,
    editable: boolean
}
export function PageViewer({page, storyId, editable}: PageProps) {
    return (<div>
        <p className='mb-5'>{page.content}</p>
        <ul key={page.id}>
            {page.nextChoices.map((choice: Choice) => {
                let link = choice.nextPageId
                    ? `/stories/${storyId}/pages/${choice.nextPageId}`
                    : `/stories/${storyId}/pages/new?parentChoiceId=${choice.id}`;
                return (
                    <li key={choice.id}>
                        <Link to={link}>
                            {choice.content}
                        </Link>
                    </li>
                )
            })}
            { editable && (page.nextChoices.length < 4)
                && <ChoiceEditor choice={{
                    parentPageId: page.id,
                    storyId: storyId
                }}/>}
        </ul>
    </div>)

}