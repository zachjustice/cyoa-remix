import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ErrorList, Field, TextareaField } from '~/utils/forms.tsx'
import styles from './choice-editor.module.css'
import {clsx} from "clsx";

export const ChoiceEditorSchema = z.object({
	id: z.string().optional(),
	content: z.string().min(1),
	parentPageId: z.string().optional(),
	storyId: z.string().optional(),
})

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

	const submission = parse(formData, {
		schema: ChoiceEditorSchema,
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

	const { content, id, parentPageId, storyId } = submission.value

	const data = {
		ownerId: userId,
		content: content,
		parentPageId,
	}

	const select = {
		id: true,
	}

	if (id) {
		const existingChoice = await prisma.choice.findFirst({
			where: { id, ownerId: userId },
			select: { id: true },
		})

		if (!existingChoice) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}

		await prisma.choice.update({
			where: { id },
			data,
			select,
		})
	} else {
		await prisma.page.update({
			where: { id: parentPageId },
			data: {
				nextChoices: {
					create: {
						owner: {connect: {id: data.ownerId}},
						content: data.content
					}
				}
			}
		})
	}

	return redirect(`/stories/${storyId}/pages/${parentPageId}/`)
}

type ChoiceEditorProps = {
	choice?: {
		id?: string;
		content?: string;
		parentPageId?: string;
		storyId?: string;
	}
};

export function ChoiceEditor(props: ChoiceEditorProps) {
	const { choice } = props;
	const choiceEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'choice-editor',
		constraint: getFieldsetConstraint(ChoiceEditorSchema),
		lastSubmission: choiceEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ChoiceEditorSchema })
		},
		defaultValue: {
			content: choice?.content,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<choiceEditorFetcher.Form
			method="post"
			action="/resources/choice-editor"
			{...form.props}
		>
			<input name="id" type="hidden" value={choice?.id} />
			<input name="parentPageId" type="hidden" value={choice?.parentPageId} />
			<input name="storyId" type="hidden" value={choice?.storyId} />
			<Field
				className="no-required-asterisk"
				labelProps={{ htmlFor: fields.content.id, children: "More choices can be made..." }}
				inputProps={{
					// ...conform.input(fields.content),
				}}
				errors={fields.content.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-end gap-4">
				<Button size="md" variant="secondary" type="reset">
					Reset
				</Button>
				<Button
					size="md"
					variant="primary"
					status={
						choiceEditorFetcher.state === 'submitting'
							? 'pending'
							: choiceEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={choiceEditorFetcher.state !== 'idle'}
				>
					Submit
				</Button>
			</div>
		</choiceEditorFetcher.Form>
	)
}
