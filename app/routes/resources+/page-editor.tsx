import {
	conform,
	type FieldConfig,
	list,
	type Submission,
	useFieldList,
	useFieldset,
	useForm,
} from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher, useNavigate } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import {
	Button,
	ButtonLink,
	type ButtonStatus,
	ErrorList,
	SimpleField,
	TextareaField,
} from '~/utils/forms.tsx'
import { requireStoryEditor } from '~/utils/permissions.server.ts'
import { useRef, useState } from 'react'
import { type ViewedChoice } from '~/routes/stories+/$storyId.pages.$pageId.tsx'
import { BsArrowReturnRight } from 'react-icons/bs/index.js'
import { logJSON } from '~/utils/logging.ts'
import Xmark from '~/components/Xmark.tsx'
import { clsx } from 'clsx'

const ChoiceSchema = z.object({
	id: z.string().optional(),
	content: z.string(),
	nextPageId: z
		.string()
		.optional()
		.refine(
			async nextPageId => {
				if (!nextPageId) {
					return false
				}
				return prisma.page.findUnique({
					where: { id: nextPageId },
					select: { id: true },
				})
			},
			{
				message:
					'Page Id does not exist. Make sure the page id is valid by copy and pasting from the URL.',
			},
		),
})

export const PageEditorSchema = z.object({
	id: z.string().optional(),
	pageContent: z.string().min(1),
	parentChoiceId: z.string().optional(),
	storyId: z.string(),
	choices: z.array(ChoiceSchema).optional(),
})

async function createOrSavePage(
	pageContent: string,
	pageId: string | undefined,
	parentChoiceId: string | undefined,
	storyId: string,
	choices: z.infer<typeof ChoiceSchema>[] | undefined,
	userId: string,
	submission: Submission,
): Promise<string> {
	if (pageId) {
		const existingPage = await prisma.page.findFirst({
			where: { id: pageId },
			select: {
				id: true,
				nextChoices: {
					select: {
						id: true,
						content: true,
						nextPageId: true,
					},
				},
			},
		})

		if (!existingPage) {
			throw json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}

		const choiceIdsToKeep = (choices || []).map(c => c.id)
		const choiceIdsToDelete = existingPage.nextChoices
			.map(c => c.id)
			.filter(existingId => !choiceIdsToKeep.includes(existingId))
			.map(idToDelete => ({
				id: idToDelete,
			}))

		await prisma.page.update({
			where: { id: pageId },
			select: { id: true },
			data: {
				content: pageContent,
				nextChoices: {
					deleteMany: choiceIdsToDelete,
				},
			},
		})

		return pageId
	}

	if (parentChoiceId) {
		// not the first page in a story
		const choice = await prisma.choice.update({
			where: { id: parentChoiceId },
			select: {
				nextPageId: true,
			},
			data: {
				nextPage: {
					create: {
						owner: { connect: { id: userId } },
						content: pageContent,
					},
				},
			},
		})

		invariant(choice?.nextPageId, `Failed to update choice ${parentChoiceId}`)
		return choice.nextPageId
	}

	// first page in a story
	const existingStory = await prisma.story.findFirst({
		where: { id: storyId },
		select: { firstPageId: true },
	})

	if (existingStory?.firstPageId) {
		throw json(
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
					owner: { connect: { id: userId } },
					content: pageContent,
				},
			},
		},
	})

	invariant(
		story.firstPageId,
		`Failed to update first page on story ${storyId}`,
	)

	return story.firstPageId
}

async function updateChoices(
	userId: string,
	pageId: string,
	choices: z.infer<typeof ChoiceSchema>[] | undefined,
) {
	for (const { id: choiceId, content, nextPageId } of choices || []) {
		if (choiceId) {
			await prisma.choice.update({
				where: { id: choiceId },
				data: {
					content,
					nextPage: nextPageId
						? { connect: { id: nextPageId } }
						: { disconnect: true },
				},
			})
		} else {
			await prisma.page.update({
				where: { id: pageId },
				data: {
					nextChoices: {
						create: {
							content,
							owner: { connect: { id: userId } },
							nextPage: nextPageId
								? { connect: { id: nextPageId } }
								: undefined,
						},
					},
				},
			})
		}
	}
}

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: PageEditorSchema,
		errorMap: (issue, ctx) => ({ message: issue.message || 'Error' }),
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

	const { pageContent, id, parentChoiceId, storyId, choices } = submission.value
	logJSON('choices', choices)

	await requireStoryEditor(storyId, userId)
	const pageId = await createOrSavePage(
		pageContent,
		id,
		parentChoiceId,
		storyId,
		choices,
		userId,
		submission,
	)

	await updateChoices(userId, pageId, choices)

	if (id) {
		// Saving changes on a pre-existing page; stay on the page
		return json({
			status: 'success',
			submission,
		})
	} else {
		// Creating a new page; redirect to the new page
		return redirect(`/stories/${storyId}/pages/${pageId}/`)
	}
}

type PageEditorProps = {
	page: {
		id?: string
		content?: string
		parentChoiceId?: string
		storyId?: string
		nextChoices?: ViewedChoice[] | null
	}
	canDeletePage: boolean
}

export function PageEditor(props: PageEditorProps) {
	const { page, canDeletePage } = props
	const pageEditorFetcher = useFetcher<typeof action>()
	const navigate = useNavigate()
	const goBack = () => navigate(-1)
	logJSON(page)

	const [form, fields] = useForm({
		id: 'page-editor',
		constraint: getFieldsetConstraint(PageEditorSchema),
		lastSubmission: pageEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: PageEditorSchema })
		},
		defaultValue: {
			pageContent: page?.content,
			choices: page?.nextChoices,
		},
		shouldRevalidate: 'onBlur',
	})
	const choices = useFieldList(form.ref, fields.choices)

	let prompt: string
	if (page?.content) {
		prompt = 'Edit the page...'
	} else if (page?.parentChoiceId) {
		prompt = 'Write the next page...'
	} else {
		prompt = 'Write the first page...'
	}

	const Subtitle = ({ children }: { children: React.ReactNode }) => (
		<h2 className="text-2xl">{children}</h2>
	)

	return (
		<div className="mb-12 h-fit space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-h1">Edit Page</h1>
				<>
					{page?.id ? (
						<ButtonLink
							size="md"
							color="secondary"
							to={`/stories/${page.storyId}/pages/${page.id}`}
						>
							Done
						</ButtonLink>
					) : (
						<Button size="md" color="secondary" onClick={goBack}>
							Back
						</Button>
					)}
				</>
			</div>
			<pageEditorFetcher.Form
				method="post"
				action="/resources/page-editor"
				autoComplete="off"
				{...form.props}
			>
				<input name="id" type="hidden" value={page?.id} />
				<input
					name="parentChoiceId"
					type="hidden"
					value={page?.parentChoiceId}
				/>
				<input name="storyId" type="hidden" value={page.storyId} />
				<div className="mb-2">
					<Subtitle>Page</Subtitle>
				</div>
				<TextareaField
					className="no-required-asterisk"
					labelProps={{
						htmlFor: fields.pageContent.id,
						children: prompt,
					}}
					textareaProps={{
						...conform.textarea(fields.pageContent),
					}}
					errors={fields.pageContent.errors}
				/>

				<div className="mb-6 flex items-center gap-4 border-b border-night-400 pb-6">
					<Subtitle>Choices</Subtitle>
					{/* TODO manually re-creating the Flowbite button as a shitty workaround to make adding choices to this list work. Using the FlowbiteButton wrapper doesn't work */}
					<button
						className="group relative flex items-center justify-center rounded-lg border border-night-400 p-0.5 text-center font-medium text-white hover:bg-accent-yellow hover:text-night-700 focus:z-10 focus:bg-accent-yellow focus:text-night-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-accent-yellow-muted dark:focus:ring-blue-800"
						{...list['insert'](fields.choices.name, { defaultValue: 'Enter' })}
					>
						<span className="flex items-center rounded-md px-3 py-1.5 text-sm transition-all duration-200">
							Add Choice
						</span>
					</button>
				</div>

				<ul>
					{choices.map((choice, index) => (
						<li key={choice.key} className="mb-6 border-b border-night-400">
							<ChoiceFieldset
								config={choice}
								index={index}
								name={fields.choices.name}
							/>
						</li>
					))}
					{!choices?.length && (
						<li className="mb-6 space-y-4 border-b border-night-400 pb-4">
							Click "<i>Add Choice</i>" above to start adding choices.
						</li>
					)}
				</ul>

				<div className="flex justify-between gap-4">
					<div className="flex gap-4">
						<Button
							size="sm"
							color="primary"
							status={
								pageEditorFetcher.state === 'submitting'
									? 'pending'
									: (pageEditorFetcher.data?.status as ButtonStatus) ?? 'idle'
							}
							type="submit"
							disabled={pageEditorFetcher.state !== 'idle'}
						>
							{page.id ? 'Save Changes' : 'Create Page'}
						</Button>
					</div>
					{page?.id && canDeletePage && (
						<div className="flex">
							<ButtonLink
								size="sm"
								color="danger"
								to={`/stories/${page.storyId}/pages/${page.id}/delete`}
							>
								Delete Page
							</ButtonLink>
						</div>
					)}
				</div>
			</pageEditorFetcher.Form>
		</div>
	)
}

type ChoiceFieldsetProps = {
	config: FieldConfig<z.infer<typeof ChoiceSchema>>
	index: number
	name: string
}

function ChoiceFieldset({ config, index, name }: ChoiceFieldsetProps) {
	const ref = useRef<HTMLFieldSetElement>(null)
	const { id, content, nextPageId } = useFieldset(ref, config)
	const [enterNextPageId, setNextPageId] = useState(false)

	const [choiceContent, setChoiceContent] = useState(content.defaultValue)

	return (
		<fieldset ref={ref} className="mb-5">
			<input type="hidden" name={id.name} value={id.defaultValue} />
			<div className="mb-2 flex items-center gap-2">
				<SimpleField
					className="no-required-asterisk w-full"
					labelProps={{
						htmlFor: content.id,
						children: `Choice #${index + 1}...`,
					}}
					inputProps={{
						...conform.input(content),
						onChange: e => setChoiceContent(e.target.value),
					}}
				/>

				<button
					{...list.remove(name, { index })}
					disabled={!!nextPageId.defaultValue}
					className="text-accent-red hover:text-accent-yellow disabled:text-night-400"
				>
					<Xmark />
				</button>
			</div>

			<ErrorList id={content.errorId} errors={content.errors} />

			<div className="flex items-center gap-2">
				<BsArrowReturnRight className="text-night-200" size={24} />
				<SimpleField
					className={clsx('w-full', {
						hidden: !enterNextPageId,
					})}
					labelProps={{
						htmlFor: nextPageId.id,
						children: `Enter Page Id`,
					}}
					inputProps={{
						...conform.input(nextPageId),
					}}
				/>
				{nextPageId.defaultValue && !enterNextPageId && (
					<span id={nextPageId.id} className="italic text-night-200">
						{nextPageId.defaultValue}
					</span>
				)}
				{(nextPageId.defaultValue || enterNextPageId) && (
					<button
						{...list.replace(name, {
							index,
							defaultValue: {
								id: id.defaultValue,
								content: choiceContent,
								nextPageId: undefined,
							},
						})}
						className="text-accent-red hover:text-accent-yellow disabled:text-night-400"
					>
						<Xmark />
					</button>
				)}
				{!nextPageId.defaultValue && !enterNextPageId && (
					<Button
						className="whitespace-nowrap"
						onClick={() => setNextPageId(!enterNextPageId)}
					>
						Link page
					</Button>
				)}
			</div>

			<ErrorList
				extraListClassName="pl-8"
				id={nextPageId.errorId}
				errors={nextPageId.errors}
			/>
		</fieldset>
	)
}
