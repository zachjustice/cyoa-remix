import { parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink } from '~/utils/forms.tsx'
import { useActionData, useLoaderData, useParams } from '@remix-run/react'
import { requireStoryEditor } from '~/utils/permissions.server.ts'

export const DeleteChoiceSchema = z.object({
	choiceId: z.string().refine(async choiceId => {
		const choice = await prisma.choice.findUnique({
			where: {
				id: choiceId,
			},
			select: {
				nextPageId: true,
			},
		})

		if (!choice) {
			return false
		}

		return !choice.nextPageId
	}, 'This choice cannot be deleted because the choice leads to another page. Delete this page or remove the connection.'),
})

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing storyId')
	invariant(params.choiceId, 'Missing choiceId')
	const { storyId, choiceId } = params

	await requireStoryEditor(storyId, userId)

	const choice = await prisma.choice.findUnique({
		where: {
			id: choiceId,
		},
		select: {
			nextPageId: true,
		},
	})

	return json({
		choice,
	})
}

export async function action({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing storyId')
	invariant(params.choiceId, 'Missing choiceId')
	const { storyId, pageId } = params

	const submission = await parse(formData, {
		schema: DeleteChoiceSchema,
		async: true,
	})

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { choiceId } = submission.value
	await requireStoryEditor(storyId, userId)

	await prisma.choice.delete({
		where: { id: choiceId },
	})

	return redirect(`/stories/${storyId}/pages/${pageId}?editMode=true`)
}

export default function DeleteChoiceRoute() {
	const { storyId, pageId, choiceId } = useParams()
	invariant(storyId, 'Missing storyId')
	invariant(pageId, 'Missing pageId')
	invariant(choiceId, 'Missing choiceId')

	const { choice } = useLoaderData<typeof loader>()

	const data = useActionData<typeof action>()
	console.log(JSON.stringify(data))
	const error = data?.submission?.error?.choiceId

	return (
		<>
			{choice?.nextPageId ? (
				<>
					<p>
						This choice cannot be deleted because the choice leads to another{' '}
						<a
							href={`/stories/${storyId}/pages/${pageId}`}
							className="text-accent-purple underline"
						>
							page
						</a>
						.
					</p>
					<p>Delete this page or remove the connection.</p>
				</>
			) : (
				<p>Are you sure you want to delete this choice?</p>
			)}
			<form method="post">
				<input name="choiceId" type="hidden" value={choiceId} />
				<div className="mt-10 flex gap-4">
					<ButtonLink
						size="sm"
						color="primary"
						type="reset"
						to={`/stories/${storyId}/pages/${pageId}?editChoiceId=${choiceId}`}
					>
						No, take me back
					</ButtonLink>
					<Button
						size="sm"
						color="danger"
						// status={
						//     pageEditorFetcher.state === 'submitting'
						//         ? 'pending'
						//         : pageEditorFetcher.data?.status ?? 'idle'
						// }
						type="submit"
						disabled={!!choice?.nextPageId}
					>
						Yes, delete forever
					</Button>
				</div>
			</form>
			{error && <p className="py-2 text-accent-red">{error}</p>}
		</>
	)
}
