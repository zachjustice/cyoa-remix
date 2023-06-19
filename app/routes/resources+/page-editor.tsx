import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink, ErrorList, TextareaField } from '~/utils/forms.tsx'

export const PageEditorSchema = z.object({
	id: z.string().optional(),
	content: z.string().min(1),
	parentChoiceId: z.string().optional(),
	storyId: z.string().optional(),
})

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

	const submission = parse(formData, {
		schema: PageEditorSchema,
		acceptMultipleErrors: () => true,
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

	let page: { id: string }

	const { content, id, parentChoiceId, storyId } = submission.value

	const data = {
		ownerId: userId,
		content: content,
	}

	if (id) {
		const existingPage = await prisma.page.findFirst({
			where: { id, ownerId: userId },
			select: { id: true },
		})

		if (!existingPage) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}

		page = await prisma.page.update({
			where: { id },
			data,
			select: {
				id: true,
			},
		})
	} else if (parentChoiceId) {
		// not the first page in a story
		const choice = await prisma.choice.update({
			where: { id: parentChoiceId },
			select: {
				nextPageId: true,
			},
			data: {
				nextPage: {
					create: {
						owner: { connect: { id: data.ownerId } },
						content: data.content,
					},
				},
			},
		})

		invariant(choice?.nextPageId, `Failed to update choice ${parentChoiceId}`)
		page = { id: choice.nextPageId }
	} else {
		// first page in a story
		const existingStory = await prisma.story.findFirst({
			where: { id: storyId },
			select: { firstPageId: true },
		})

		if (existingStory?.firstPageId) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 400 },
			)
		}

		const story = await prisma.story.update({
			where: { id: storyId },
			select: {
				firstPageId: true,
			},
			data: {
				firstPage: {
					create: {
						owner: { connect: { id: data.ownerId } },
						content: data.content,
					},
				},
			},
		})

		invariant(
			story.firstPageId,
			`Failed to update first page on story ${storyId}`,
		)
		page = { id: story.firstPageId }
	}

	return redirect(`/stories/${storyId}/pages/${page.id}/`)
}

type PageEditorProps = {
	page?: {
		id?: string
		content?: string
		parentChoiceId?: string
		storyId?: string
	}
}

export function PageEditor(props: PageEditorProps) {
	const { page } = props
	const pageEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'page-editor',
		constraint: getFieldsetConstraint(PageEditorSchema),
		lastSubmission: pageEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: PageEditorSchema })
		},
		defaultValue: {
			content: page?.content,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<pageEditorFetcher.Form
			method="post"
			action="/resources/page-editor"
			autoComplete="off"
			{...form.props}
		>
			<input name="id" type="hidden" value={page?.id} />
			<input name="parentChoiceId" type="hidden" value={page?.parentChoiceId} />
			<input name="storyId" type="hidden" value={page?.storyId} />
			<TextareaField
				className="no-required-asterisk"
				labelProps={{
					htmlFor: fields.content.id,
					children: 'This page is blank...',
				}}
				textareaProps={{
					...conform.textarea(fields.content),
				}}
				errors={fields.content.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-between gap-4">
				{page?.id && (
					<div className="flex">
						<ButtonLink
							size="sm"
							variant="danger"
							to={`/stories/${page.storyId}/pages/${page.id}/delete`}
						>
							Delete
						</ButtonLink>
					</div>
				)}
				<div className="flex gap-4">
					{page?.id && (
						<ButtonLink
							size="sm"
							variant="secondary"
							type="reset"
							to={`/stories/${page.storyId}/pages/${page.id}`}
						>
							Cancel
						</ButtonLink>
					)}
					<Button
						size="sm"
						variant="primary"
						status={
							pageEditorFetcher.state === 'submitting'
								? 'pending'
								: pageEditorFetcher.data?.status ?? 'idle'
						}
						type="submit"
						disabled={pageEditorFetcher.state !== 'idle'}
					>
						Save
					</Button>
				</div>
			</div>
		</pageEditorFetcher.Form>
	)
}
