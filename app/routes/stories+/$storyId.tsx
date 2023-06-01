import {type DataFunctionArgs, json} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import invariant from "tiny-invariant";
import {prisma} from "~/utils/db.server.ts";
import {ButtonLink} from "~/utils/forms.tsx";
import {getUserId} from "~/utils/auth.server.ts";
import {formatPublishDate} from "~/utils/dateFormat.ts";

export async function loader({params, request}: DataFunctionArgs) {
    invariant(params.storyId, 'Missing storyId')

    const userId = await getUserId(request)

    const story = await prisma.story.findUnique({
        where: {id: params.storyId},
        select: {
            id: true,
            title: true,
            firstPageId: true,
            description: true,
            createdAt: true,
            owner: {
                select: {
                    id: true,
                    username: true,
                }
            }
        },
    })
    if (!story) {
        throw new Response('not found', {status: 404})
    }
    return json({story, isOwner: story.owner.id === userId})
}

export default function GetStoryRoute() {
    const {story, isOwner} = useLoaderData<typeof loader>()

    let link = story.firstPageId ? `pages/${story.firstPageId}/` : `pages/new/`;
    return (
        <div className="flex h-full flex-col">
            <div className="flex-grow">
                <h2 className="text-h2 ">{story.title}</h2>
                <p className="text-md md:text-md mb-2 lg:mb-6">
                    By <Link to={`/users/${story.owner.username}`} className='italic underline'>{story.owner.username}</Link>
                    {' | '}Published {formatPublishDate(story.createdAt)}
                </p>
                <p className="text-sm md:text-lg">{story.description}</p>
                <div className="mt-10 flex gap-4">
                    <ButtonLink
                        to={link}
                        size="md"
                        variant="primary"
                        type="submit"
                    >
                        Begin
                    </ButtonLink>
                </div>
            </div>
            {isOwner ? (
                <div className="flex justify-end gap-4">
                    {/*<DeleteStory id={story.id} />*/}
                    <ButtonLink size="md" variant="primary" to="edit">
                        Edit
                    </ButtonLink>
                </div>
            ) : null}
        </div>
    )
}
