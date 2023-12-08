import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { useOptionalUser } from '~/hooks/useUser.ts'
import { useMatchesData } from '~/hooks/useMatchesData.ts'

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
	const optionalUser = useOptionalUser()
	const { canAddPage } = useMatchesData(`/stories/${data?.storyId}`) as {
		canAddPage: boolean
	}

	if (canAddPage) {
		return (
			<PageEditor
				page={{
					storyId: data?.storyId,
					parentChoiceId: data?.parentChoiceId,
				}}
				canDeletePage={false}
			/>
		)
	} else if (!optionalUser) {
		return (
			<div>
				<p>The pages end here... </p>
				<p>
					<a className="font-bold underline" href="/signup">
						Sign up
					</a>{' '}
					or{' '}
					<a className="font-bold underline" href="/login">
						log-in
					</a>{' '}
					if you already have an account
				</p>
			</div>
		)
	} else {
		return (
			<div>
				<p>The pages end here... </p>
			</div>
		)
	}
}
