import { Link, useFetcher, useLoaderData, useParams } from '@remix-run/react'
import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { Button, ErrorList, Field } from '~/utils/forms.tsx'
import { z } from 'zod'

import { getUserId, requireUserId } from '~/utils/auth.server.ts'
import { Badge, Label, Radio, Tabs } from 'flowbite-react'
import { FaInfoCircle } from 'react-icons/fa/index.js'
import { Tooltip } from '~/components/Tooltip.tsx'
import StorySettingsUserDropDown from '~/components/StorySettingsUserDropdown.tsx'
import { prisma } from '~/utils/db.server.ts'
import invariant from 'tiny-invariant'
import { getUserImgSrc } from '~/utils/misc.ts'
import { type DataFunctionArgs, json } from '@remix-run/node'

export enum StorySettingsOperations {
	Add = 'add',
	Update = 'update',
	Remove = 'remove',
}

export enum StoryPermissions {
	ReadStory = 'story/read',
	EditStory = 'story/edit',
	PublicStory = 'story/public',
	PrivateStory = 'story/private',
}

export type StoryPermissionsType = `${StoryPermissions}`
export type StorySettingsOperationsType = `${StorySettingsOperations}`

export const AddReaderFormSchema = z.object({
	storyId: z.string(),
	storyMemberUsername: z.string().optional(),
	operation: z.nativeEnum(StorySettingsOperations),
	permission: z.nativeEnum(StoryPermissions),
})

async function getStoryOwnerAndStoryMembers(storyId: string, userId: string) {
	const storyOwnerAndStoryMembers = await prisma.story.findUnique({
		where: { id: storyId },
		select: {
			id: true,
			isPublic: true,
			owner: { select: { id: true, username: true } },
			storyMembers: {
				select: {
					id: true,
					permission: {
						select: {
							id: true,
							name: true,
						},
					},
					user: {
						select: {
							id: true,
							username: true,
							imageId: true,
						},
					},
				},
			},
		},
	})

	if (!storyOwnerAndStoryMembers) {
		throw new Response('not found', { status: 404 })
	}

	const storyOwnerId = storyOwnerAndStoryMembers.owner.id

	if (userId !== storyOwnerId) {
		throw new Response('access denied', { status: 403 })
	}

	return storyOwnerAndStoryMembers
}

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(userId, 'Missing userId')

	const storyOwnerAndStoryMembers = await getStoryOwnerAndStoryMembers(
		params.storyId,
		userId,
	)

	return json({ storyOwnerAndStoryMembers })
}

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	invariant(userId, 'Missing userId')

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

	const {
		storyMemberUsername: rawStoryMemberUsername,
		storyId,
		permission,
		operation,
	} = submission.value
	const storyMemberUsername = rawStoryMemberUsername?.trim()
	console.log('oopsie', JSON.stringify(submission.value))

	if (
		permission === StoryPermissions.PrivateStory ||
		permission === StoryPermissions.PublicStory
	) {
		console.log(
			'updating isPublic',
			permission,
			permission === StoryPermissions.PublicStory,
		)
		await prisma.story.update({
			where: {
				id: storyId,
			},
			data: {
				isPublic: permission === StoryPermissions.PublicStory,
			},
		})
	} else if (
		operation === StorySettingsOperations.Add ||
		operation === StorySettingsOperations.Update
	) {
		invariant(storyMemberUsername, 'Missing storyMemberUsername')
		await createOrUpdateStoryMember(
			storyId,
			userId,
			storyMemberUsername,
			operation,
			permission,
		)
	} else if (operation === StorySettingsOperations.Remove) {
		invariant(storyMemberUsername, 'Missing storyMemberUsername')
		await removeStoryMember(storyId, storyMemberUsername)
	}

	return json({
		status: 'success',
		submission,
	} as const)
}

async function removeStoryMember(storyId: string, storyMemberUsername: string) {
	const { id } = await prisma.user.findUniqueOrThrow({
		where: {
			username: storyMemberUsername,
		},
		select: { id: true },
	})

	return prisma.storyMember.deleteMany({
		where: {
			storyId: storyId,
			userId: id,
		},
	})
}

async function createOrUpdateStoryMember(
	storyId: string,
	userId: string,
	storyMemberUsername: string,
	operation: StorySettingsOperationsType,
	permission: StoryPermissionsType,
) {
	const { owner, storyMembers } = await getStoryOwnerAndStoryMembers(
		storyId,
		userId,
	)
	const maybeExistingStoryMember = storyMembers.find(
		({ user: { username: existingUsername } }) => {
			return storyMemberUsername === existingUsername
		},
	)

	// If user is already a reader/editor or is the story owner
	if (owner.username === storyMemberUsername) {
		// TODO indicate in the UI if a user is already in the list
		// return json({status: 'success', submission})
		return
	}

	// Check if the user is already an editor; if so adding the user as a reader doesn't make sense and we can stop
	if (
		maybeExistingStoryMember?.permission.name === StoryPermissions.EditStory &&
		permission === StoryPermissions.ReadStory &&
		operation === StorySettingsOperations.Add
	) {
		return
	}

	return prisma.storyMember.upsert({
		where: {
			id: maybeExistingStoryMember?.id || '',
		},
		update: {
			permission: { connect: { name: permission } },
		},
		create: {
			story: { connect: { id: storyId } },
			user: { connect: { username: storyMemberUsername.trim() } },
			permission: { connect: { name: permission } },
		},
	})
}

export const MAX_STORY_MEMBERS = 20

export default function StorySettingsRoute() {
	const { storyId } = useParams()
	invariant(storyId, 'missing storyId')

	const { storyOwnerAndStoryMembers } = useLoaderData<typeof loader>()
	const { isPublic } = storyOwnerAndStoryMembers
	const addStoryMemberForm = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: `add-reader-${storyId}`,
		constraint: getFieldsetConstraint(AddReaderFormSchema),
		lastSubmission: addStoryMemberForm.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: AddReaderFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="space-y-6">
			<h1 className="text-h1">Settings</h1>
			{/* eslint-disable-next-line react/style-prop-object */}
			<Tabs style="fullWidth">
				<Tabs.Item active title="Visibility">
					<h2 className="text-h4">Manage Visibility</h2>
					<form method="POST" className="space-y-4">
						<input name="storyId" type="hidden" value={storyId} />
						<input
							name="operation"
							type="hidden"
							value={StorySettingsOperations.Update}
						/>
						<fieldset className="flex max-w-md flex-col gap-4">
							<legend className="mb-4">
								Can everyone read or only selected readers and editors?
							</legend>
							<div className="flex items-center gap-2">
								<Radio
									id="public"
									name="permission"
									value={StoryPermissions.PublicStory}
									defaultChecked={isPublic}
								/>
								<Label htmlFor="public" className="text-white">
									Everyone can read
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Radio
									id="private"
									name="permission"
									value={StoryPermissions.PrivateStory}
									defaultChecked={!isPublic}
								/>
								<Label htmlFor="private" className="text-white">
									Onlv selected readers and editors
								</Label>
							</div>
						</fieldset>
						<div className="flex items-center gap-4">
							<Button type="submit" color="primary">
								Save Settings
							</Button>
						</div>
					</form>
				</Tabs.Item>
				<Tabs.Item title="Readers & Editors">
					<div className="space-y-4">
						<div className="flex gap-4">
							<h2 className="text-h4">Manage Readers and Editors</h2>
							<Tooltip
								content="This section controls the readers and editors for this story."
								icon={FaInfoCircle}
							/>
						</div>
						<div>
							<addStoryMemberForm.Form
								method="post"
								// action="/resources/choice-editor"
								autoComplete="off"
								{...form.props}
							>
								<input name="storyId" type="hidden" value={storyId} />
								<input
									name="permission"
									type="hidden"
									value={StoryPermissions.ReadStory}
								/>
								<input
									name="operation"
									type="hidden"
									value={StorySettingsOperations.Add}
								/>
								<div className="flex gap-4">
									<div className="grow">
										<Field
											className="no-required-asterisk"
											labelProps={{
												htmlFor: fields.storyMemberUsername.id,
												children:
													'You can add up to 20 users as readers or editors. Enter a username to get started.',
											}}
											inputProps={{
												...conform.input(fields.storyMemberUsername),
											}}
											errors={fields.storyMemberUsername.errors}
										/>
										<ErrorList errors={form.errors} id={form.errorId} />
									</div>
									<div className="align-middle">
										<Button
											size="lg"
											color="primary"
											status={
												addStoryMemberForm.state === 'submitting'
													? 'pending'
													: 'idle'
											}
											type="submit"
											disabled={
												addStoryMemberForm.state !== 'idle' ||
												storyOwnerAndStoryMembers.storyMembers?.length >
													MAX_STORY_MEMBERS
											}
										>
											Add User
										</Button>
									</div>
								</div>
							</addStoryMemberForm.Form>
							<div className="flex gap-2">
								<p>
									Readers & Editors (
									{storyOwnerAndStoryMembers.storyMembers?.length ?? 0})
								</p>
								<Tooltip
									content="A maximum of 20 readers and/or editors is allowed."
									icon={FaInfoCircle}
								/>
							</div>
							<ul>
								{!storyOwnerAndStoryMembers.storyMembers?.length && (
									<li>Add a user as a reader to your story to get started</li>
								)}
								{storyOwnerAndStoryMembers?.storyMembers.map(storyMember => (
									<li
										key={storyMember.user.id}
										className="mb-1 flex justify-between border-t border-night-200 pt-1"
									>
										<Link
											to={`/users/${storyMember.user.username}`}
											// this is for progressive enhancement
											onClick={e => e.preventDefault()}
											className="flex flex-grow items-center gap-2 py-2 pl-2 pr-4 outline-none hover:bg-night-400 focus:bg-night-400 radix-state-open:bg-night-400"
										>
											<img
												className="h-8 w-8 rounded-full bg-accent-purple-muted object-cover"
												alt={`user avatar for ${storyMember.user.username}`}
												src={getUserImgSrc(storyMember.user.imageId)}
											/>
											<span className="text-body-sm">
												{storyMember.user.username}
											</span>
											{storyMember.permission.name === 'story/edit' && (
												<Badge color="success">Editor</Badge>
											)}
										</Link>
										<StorySettingsUserDropDown
											username={storyMember.user.username}
											storyId={storyId}
											currentPermission={
												storyMember.permission.name as StoryPermissionsType
											}
										/>
									</li>
								))}
							</ul>
						</div>
					</div>
				</Tabs.Item>
			</Tabs>
		</div>
	)
}
