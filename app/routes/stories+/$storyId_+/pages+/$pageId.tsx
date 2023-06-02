import invariant from "tiny-invariant";
import {type DataFunctionArgs, json} from "@remix-run/node";
import {getUserId} from "~/utils/auth.server.ts";
import {prisma} from "~/utils/db.server.ts";
import {Link, useLoaderData} from "@remix-run/react";
import {PageViewer} from "~/routes/resources+/Page.tsx";

export async function loader({params, request}: DataFunctionArgs) {
    const userId = await getUserId(request)
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
            },
            ownerId: true,
        }
    })

    if (!page) {
        throw new Response('not found', {status: 404})
    }
    return json({page, storyId: params.storyId, isOwner: page.ownerId === userId})
}

export default function GetPageRoute() {
    const data = useLoaderData<typeof loader>();

    return <PageViewer page={data.page} storyId={data.storyId} editable={data.isOwner}/>
}