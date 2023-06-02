import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ErrorList, Field, TextareaField } from '~/utils/forms.tsx'

export const StoryEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	description: z.string().min(1),
})

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const submission = parse(formData, {
		schema: StoryEditorSchema,
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

	let story: { id: string; owner: { username: string } }

	const { title, description, id } = submission.value

	const data = {
		ownerId: userId,
		title: title,
		description: description,
	}

	const select = {
		id: true,
		owner: {
			select: {
				username: true,
			},
		},
	}

	if (id) {
		const existingStory = await prisma.story.findFirst({
			where: { id, ownerId: userId },
			select: { id: true },
		})

		if (!existingStory) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}

		story = await prisma.story.update({
			where: { id },
			data,
			select,
		})
	} else {
		story = await prisma.story.create({ data, select })
	}

	return redirect(`/stories/${story.id}`)
}

export function StoryEditor({
	story,
}: {
	story?: { id: string; title: string; description: string }
}) {
	const storyEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'story-editor',
		constraint: getFieldsetConstraint(StoryEditorSchema),
		lastSubmission: storyEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: StoryEditorSchema })
		},
		defaultValue: {
			title: story?.title,
			description: story?.description,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<storyEditorFetcher.Form
			method="post"
			action="/resources/story-editor"
			{...form.props}
		>
			<input name="id" type="hidden" value={story?.id} />
			<Field
				labelProps={{ htmlFor: fields.title.id, children: 'Title' }}
				inputProps={{
					...conform.input(fields.title),
					autoComplete: 'title',
				}}
				errors={fields.title.errors}
			/>
			<TextareaField
				labelProps={{ htmlFor: fields.description.id, children: 'Description' }}
				textareaProps={{
					...conform.textarea(fields.description),
					autoComplete: 'description',
				}}
				errors={fields.description.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-end gap-4">
				<Button size="sm" variant="secondary" type="reset">
					Reset
				</Button>
				<Button
					size="sm"
					variant="primary"
					status={
						storyEditorFetcher.state === 'submitting'
							? 'pending'
							: storyEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={storyEditorFetcher.state !== 'idle'}
				>
					Submit
				</Button>
			</div>
		</storyEditorFetcher.Form>
	)
}
