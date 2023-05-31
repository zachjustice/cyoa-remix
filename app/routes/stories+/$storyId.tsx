import {type DataFunctionArgs, json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import invariant from "tiny-invariant";
import {prisma} from "~/utils/db.server.ts";
import {ButtonLink} from "~/utils/forms.tsx";

export async function loader({params}: DataFunctionArgs) {
    invariant(params.storyId, 'Missing storyId')
    const story = await prisma.story.findUnique({
        where: {id: params.storyId},
        select: {
            id: true,
            title: true,
            firstPageId: true,
            description: true,
        },
    })
    if (!story) {
        throw new Response('not found', {status: 404})
    }
    return json({story, isOwner: false})
}

export default function GetStoryRoute() {
    const {story} = useLoaderData<typeof loader>()

    let link = story.firstPageId ? `pages/${story.firstPageId}/`: `pages/new/`;
    return (
        <div className="flex h-full flex-col">
            <div className="flex-grow">
                <h2 className="mb-2 text-h2 lg:mb-6">{story.title}</h2>
                <p className="text-sm md:text-lg">{story.description}</p>
                <div className="mt-10 flex gap-4">
                    <ButtonLink
                        to={link}
                        size="md"
                        variant="primary"
                        type="submit"
                        // status={
                        //     storyEditorFetcher.state === 'submitting'
                        //         ? 'pending'
                        //         : storyEditorFetcher.data?.status ?? 'idle'
                        // }
                        // disabled={storyEditorFetcher.state !== 'idle'}
                    >
                        Begin
                    </ButtonLink>
                </div>
            </div>
            {/*{data.isOwner ? (*/}
            {/*    <div className="flex justify-end gap-4">*/}
            {/*        /!*<DeleteNote id={data.note.id} />*!/*/}
            {/*        /!*<ButtonLink size="md" variant="primary" to="edit">*!/*/}
            {/*        /!*    Edit*!/*/}
            {/*        /!*</ButtonLink>*!/*/}
            {/*    </div>*/}
            {/*) : null}*/}
        </div>
    )
}
