import {Outlet} from "@remix-run/react";
import {PageHistory} from "~/components/PageHistory.tsx";
import {StoryNavigatorSidebar} from "~/components/StoryNavigatorSidebar.tsx";

type StoryNavigatorProps = {stories: { id: string, title: string }[]};

export function StoryNavigator(props: StoryNavigatorProps) {
    const {stories} = props;

    return (
        <div className="flex h-full pb-12">
            <div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-500 pl-2 md:container md:rounded">
                <StoryNavigatorSidebar stories={stories}/>
                <main className="col-span-3 bg-night-400 px-10 py-12 md:rounded">
                    <Outlet/>
                    <div className='mt-6'>
                        <PageHistory />
                    </div>
                </main>
            </div>
        </div>
    )
}
