import invariant from "tiny-invariant";
import {type DataFunctionArgs, json} from "@remix-run/node";
import {prisma} from "~/utils/db.server.ts";
import {Link, useLoaderData} from "@remix-run/react";
import {ChoiceEditor} from "~/routes/resources+/choice-editor.tsx";

export async function loader({params}: DataFunctionArgs) {
    invariant(params.storyId, 'Missing storyId')
    invariant(params.pageId, 'Missing pageId')

    const page = await prisma.page.findUnique({
        where: {id: params.pageId},
        select: {
            id: true,
            content: true,
            nextChoices: {
                select: {
                    id: true,
                    content: true,
                    nextPageId: true,
                }
            }
        }
    })

    if (!page) {
        throw new Response('not found', {status: 404})
    }
    return json({page, storyId: params.storyId})
}

export default function GetPageRoute() {
    const data = useLoaderData<typeof loader>();
    return (
        <div>
            <p className='mb-5'>{data.page.content}</p>
            <ul key={data.page.id}>
                {data.page.nextChoices.map(choice => {
                    let link = choice.nextPageId
                        ? `/stories/${data.storyId}/pages/${choice.nextPageId}`
                        : `/stories/${data.storyId}/pages/new?parentChoiceId=${choice.id}`;
                    return (
                        <li key={choice.id}>
                            <Link to={link}>
                                {choice.content}
                            </Link>
                        </li>
                    )
                })}
                {(data.page.nextChoices.length < 4)
                    && <ChoiceEditor choice={{
                        parentPageId: data.page.id,
                        storyId: data.storyId
                    }}/>}
            </ul>
        </div>
    )
}