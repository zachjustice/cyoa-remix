import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { StoryNavigator } from '~/components/StoryNavigator.tsx'
import { StoryActivityProvider } from '~/context/story-activity-context.tsx'
import { prisma } from '~/utils/db.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	const stories = await prisma.story.findMany({
		select: {
			id: true,
			title: true,
		},
	})

	return json({
		stories,
	})
}

export default function GetStoriesRoute() {
	const data = useLoaderData<typeof loader>()
	console.log('## Get STories ourte')

	return (
		<StoryActivityProvider>
			<StoryNavigator stories={data.stories} />
		</StoryActivityProvider>
	)
}
