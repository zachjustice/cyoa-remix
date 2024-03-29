import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import {
	ButtonLink,
	ErrorList,
	Field,
	Button,
	TextareaField,
} from '~/utils/forms.tsx'
import { requireStoryEditor } from '~/utils/permissions.server.ts'

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
			where: { id },
			select: {
				id: true,
			},
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

		await requireStoryEditor(existingStory.id, userId)

		story = await prisma.story.update({
			where: { id },
			data: {
				title: title,
				description: description,
			},
			select,
		})
	} else {
		story = await prisma.story.create({
			data: {
				ownerId: userId,
				title: title,
				description: description,
			},
			select,
		})
	}

	return redirect(`/stories/${story.id}/introduction`)
}

type StoryEditorProps = {
	story?: { id: string; title: string; description: string }
	canDeleteStory?: boolean
}

export function StoryEditor({ story, canDeleteStory }: StoryEditorProps) {
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
		<div>
			<h1 className="mb-4 text-h1">New Story</h1>
			<h2 className="mb-8">
				Provide a title and brief description. Don't worry- you can edit this
				information later.
			</h2>

			<storyEditorFetcher.Form
				method="post"
				action="/resources/story-editor"
				autoComplete="off"
				{...form.props}
			>
				<input name="id" type="hidden" value={story?.id} />
				{/* TODO only the story owner can change the title */}
				<Field
					labelProps={{ htmlFor: fields.title.id, children: 'Title' }}
					inputProps={{
						...conform.input(fields.title),
					}}
					errors={fields.title.errors}
				/>
				<TextareaField
					labelProps={{
						htmlFor: fields.description.id,
						children: 'Description',
					}}
					textareaProps={{
						...conform.textarea(fields.description),
					}}
					errors={fields.description.errors}
				/>
				<ErrorList errors={form.errors} id={form.errorId} />
				<div className="flex justify-between gap-4">
					{story?.id && canDeleteStory && (
						<div className="flex">
							<ButtonLink
								size="sm"
								color="danger"
								to={`/stories/${story.id}/delete`}
							>
								Delete
							</ButtonLink>
						</div>
					)}
					<div className="flex gap-4">
						{story?.id && (
							<ButtonLink
								size="sm"
								color="secondary"
								to={`/stories/${story.id}/introduction`}
							>
								Cancel
							</ButtonLink>
						)}
						<Button
							size="sm"
							color="primary"
							status={
								storyEditorFetcher.state === 'submitting'
									? 'pending'
									: storyEditorFetcher.data?.status ?? 'idle'
							}
							type="submit"
							disabled={storyEditorFetcher.state !== 'idle'}
						>
							Save
						</Button>
					</div>
				</div>
			</storyEditorFetcher.Form>
		</div>
	)
}
