import {Outlet} from "@remix-run/react";
import {StoryNavigatorSidebar} from "~/components/StoryNavigatorSidebar.tsx";
import {useCurrentStory, useOptionalCurrentStory, usePageHistory} from "~/context/StoryActivityContext.tsx";
import {PageViewer} from "~/routes/resources+/Page.tsx";

type StoryNavigatorProps = {stories: { id: string, title: string }[]};

export function StoryNavigator(props: StoryNavigatorProps) {
    const {stories} = props;
    const currentStory = useOptionalCurrentStory();
    const pageHistory = usePageHistory();

    return (
        <div className="flex h-full pb-12">
            <div className="mx-auto grid w-full flex-grow grid-cols-4 bg-night-500 pl-2 md:container md:rounded">
                <StoryNavigatorSidebar stories={stories}/>
                <main className="col-span-3 bg-night-400 px-10 py-12 md:rounded">
                    <Outlet/>
                    <div className='mt-6'>
                        {currentStory && pageHistory.reverse().map((page, index) => {
                            return (
                                <div key={page.id} className='pt-6 pb-6 border-t-2 border-t-gray-400 border-b-gray-400 flex flex-row'>
                                    <div className='content-center flex-none w-7'>
                                        <p className='text-gray-400 font-bold'>{pageHistory.length - index}</p>
                                    </div>
                                    <div className='col-span-11'>
                                        <PageViewer editable={false}
                                                    page={page}
                                                    storyId={currentStory.id}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </main>
            </div>
        </div>
    )
}
