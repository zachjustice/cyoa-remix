import {PageEditor} from "~/routes/resources+/page-editor.tsx";
import {DataFunctionArgs, json} from "@remix-run/node";
import invariant from "tiny-invariant";
import {useLoaderData} from "@remix-run/react";
import * as url from "url";

export async function loader({params, request}: DataFunctionArgs) {
    const url = new URL(request.url)
    const parentChoiceId = url.searchParams.get('parentChoiceId')

    invariant(params.storyId, 'Missing storyId')
    invariant(parentChoiceId, 'Missing storyId')

    return json({
        storyId: params.storyId,
        parentChoiceId
    })
}

export default function CreatePage() {
    const data = useLoaderData<typeof loader>();
    return <PageEditor page={{
        storyId: data?.storyId,
        parentChoiceId: data?.parentChoiceId
    }}/>
}