import {useOptionalCurrentStory, usePageHistory} from "~/context/story-activity-context.tsx";
import {PageViewer} from "~/routes/resources+/Page.tsx";

export function PageHistory() {
    const currentStory = useOptionalCurrentStory();
    const pageHistory = usePageHistory();

    if (!currentStory) {
        return null;
    }

    return <>
        {pageHistory.reverse().map((page, index) => {
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
    </>
}