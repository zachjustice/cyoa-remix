import { Link, useFetcher, useParams } from '@remix-run/react'
import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { ErrorList, Field, MyButton } from '~/utils/forms.tsx'
import { z } from 'zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server.ts'
import { Badge, ToggleSwitch } from 'flowbite-react'
import { useState } from 'react'
import classNames from 'classnames'
import { FaInfoCircle } from 'react-icons/fa/index.js'
import { Tooltip } from '~/components/Tooltip.tsx'
import StorySettingsUserDropDown from '~/components/StorySettingsUserDropdown.tsx'

export const AddReaderFormSchema = z.object({
	storyId: z.string(),
	readerUserId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	await requireUserId(request)

	const formData = await request.formData()

	const submission = parse(formData, {
		schema: AddReaderFormSchema,
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

	// TODO update DB
	// const { readerUserId, storyId } = submission.value

	return json({
		status: 'success',
		submission,
	} as const)
}

export default function StorySettingsRoute() {
	const { storyId } = useParams()
	const addReaderForm = useFetcher<typeof action>()
	const [isPublic, setIsPublic] = useState(false)

	const [form, fields] = useForm({
		id: `add-reader-${storyId}`,
		constraint: getFieldsetConstraint(AddReaderFormSchema),
		lastSubmission: addReaderForm.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: AddReaderFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="space-y-6">
			<h1 className="text-h1">Settings</h1>
			<div className="space-y-4">
				<div className="flex gap-4">
					<h2 className="text-h4">Who can read this story?</h2>
					<Tooltip
						content="This section controls who can read the story: everyone or only
                                     selected users."
						icon={FaInfoCircle}
					/>
				</div>
				<ToggleSwitch
					color="purple"
					checked={isPublic}
					onChange={setIsPublic}
					label={
						isPublic ? 'Everyone can read' : 'Only selected users can read'
					}
				/>
				<div
					className={classNames({
						hidden: isPublic,
					})}
				>
					<addReaderForm.Form
						method="post"
						// action="/resources/choice-editor"
						autoComplete="off"
						{...form.props}
					>
						<input name="storyId" type="hidden" value={storyId} />
						<div className="flex gap-4">
							<div className="grow">
								<Field
									className="no-required-asterisk"
									labelProps={{
										htmlFor: fields.readerUserId.id,
										children: 'Add user',
									}}
									inputProps={{
										...conform.input(fields.readerUserId),
									}}
									errors={fields.readerUserId.errors}
								/>
								<ErrorList errors={form.errors} id={form.errorId} />
							</div>
							<div className="align-middle">
								<MyButton
									size="lg"
									color="primary"
									status={
										addReaderForm.state === 'submitting' ? 'pending' : 'idle'
									}
									type="submit"
									disabled={addReaderForm.state !== 'idle'}
								>
									Add Member
								</MyButton>
							</div>
						</div>
					</addReaderForm.Form>
					<p>Readers (10)</p>
					<ul>
						{['Emily Beeples', 'Xi Jiping', 'Mark Grotto', 'Jamal Hampton'].map(
							name => (
								<li
									key={name}
									className="mb-1 flex justify-between border-t border-night-200 pt-1"
								>
									<Link
										to={`/users/`}
										// this is for progressive enhancement
										onClick={e => e.preventDefault()}
										className="flex flex-grow items-center gap-2 py-2 pl-2 pr-4 outline-none hover:bg-night-400 focus:bg-night-400 radix-state-open:bg-night-400"
									>
										<img
											className="h-8 w-8 rounded-full bg-accent-purple-muted object-cover"
											alt={name}
											src={`/img/user.png`}
										/>
										<span className="text-body-sm">{name}</span>
										<Badge color="success">Editor</Badge>
									</Link>
									<StorySettingsUserDropDown />
								</li>
							),
						)}
					</ul>
				</div>
			</div>
		</div>
	)
}
