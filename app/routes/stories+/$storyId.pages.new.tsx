import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { useOptionalUser } from '~/hooks/useUser.ts'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { prisma } from '~/utils/db.server.ts'
import { Accordion } from 'flowbite-react'

export async function loader({ params, request }: DataFunctionArgs) {
	const { storyId } = params
	const url = new URL(request.url)
	// PageEditor.props.parentChoiceId is optional (which means undefined is ok; null is different though)
	// .get() will return null if data is absent
	const parentChoiceId = url.searchParams.get('parentChoiceId') || undefined
	invariant(storyId, 'Missing storyId')

	const previousPageAndChoice = parentChoiceId
		? await prisma.choice.findUnique({
				where: {
					id: parentChoiceId,
				},
				select: {
					content: true,
					parentPage: {
						select: {
							content: true,
						},
					},
				},
		  })
		: null

	return json({
		storyId: params.storyId,
		parentChoiceId,
		previousPageContent: previousPageAndChoice?.parentPage.content,
		previousChoiceContent: previousPageAndChoice?.content,
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
			<>
				{data.previousPageContent && (
					<Accordion className="mb-8" collapseAll>
						<Accordion.Panel>
							<Accordion.Title>Previous Page</Accordion.Title>
							<Accordion.Content>
								<p className="preserve-whitespace">
									{data.previousPageContent}
								</p>
								<p className="ml-12 font-bold">{data.previousChoiceContent}</p>
							</Accordion.Content>
						</Accordion.Panel>
					</Accordion>
				)}
				<PageEditor
					page={{
						storyId: data?.storyId,
						parentChoiceId: data?.parentChoiceId,
					}}
					canDeletePage={false}
				/>
			</>
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
