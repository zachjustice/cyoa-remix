import {NavLink} from "@remix-run/react";
import {clsx} from "clsx";
import {useStoryActivityDispatch} from "~/context/StoryActivityContext.tsx";

type StorySidebarProps = {
    stories: { id: string, title: string }[]
};

export function StoryNavigatorSidebar(props: StorySidebarProps) {
    const {stories} = props;
    const dispatch = useStoryActivityDispatch();
    const navLinkDefaultClassName =
        'line-clamp-2 block rounded-l py-2 pl-8 pr-6 text-base lg:text-xl'

    return (
        <div className="col-span-1 py-12">
            <ul>
                <li>
                    <NavLink
                        to="stories/new"
                        className={({isActive}) =>
                            clsx(navLinkDefaultClassName, {
                                'bg-night-400': isActive,
                            })
                        }
                    >
                        + New Story
                    </NavLink>
                </li>
                {stories.map(story => (
                    <li key={story.id}>
                        <NavLink
                            to={`stories/${story.id}`}
                            onClick={() => dispatch({type: 'reset-story-activity', payload: null})}
                            className={({isActive}) =>
                                clsx(navLinkDefaultClassName, {
                                    'bg-night-400': isActive,
                                })
                            }>
                            {story.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    )
}
