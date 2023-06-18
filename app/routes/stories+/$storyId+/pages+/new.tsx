import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { PageEditor } from '~/routes/resources+/page-editor.tsx'

export async function loader({ params, request }: DataFunctionArgs) {
	const url = new URL(request.url)
	// PageEditor.props.parentChoiceId is optional (which means undefined is ok; null is different though)
	// .get() will return null if data is absent
	const parentChoiceId = url.searchParams.get('parentChoiceId') || undefined

	invariant(params.storyId, 'Missing storyId')

	return json({
		storyId: params.storyId,
		parentChoiceId,
	})
}

export default function CreatePage() {
	const data = useLoaderData<typeof loader>()
	return (
		<PageEditor
			page={{
				storyId: data?.storyId,
				parentChoiceId: data?.parentChoiceId,
			}}
		/>
	)
}
