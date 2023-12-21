import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { PiDotsThreeCircleVerticalFill } from 'react-icons/pi/index.js'
import { Form, Link } from '@remix-run/react'
import { Simulate } from 'react-dom/test-utils'
import submit = Simulate.submit
import {
	StoryPermissions,
	type StoryPermissionsType,
	StorySettingsOperations,
} from '~/routes/stories+/$storyId.settings.tsx'

type StorySettingsUserDropDownProps = {
	username: string
	storyId: string
	currentPermission: StoryPermissionsType
}

export default function StorySettingsUserDropDown({
	username,
	storyId,
	currentPermission,
}: StorySettingsUserDropDownProps) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className="flex items-center">
					<PiDotsThreeCircleVerticalFill className="hover: ml-2 h-8 w-8 rounded-full text-color-primary text-color-subtitle hover:cursor-pointer" />
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className="flex flex-col rounded bg-[#323232]">
					<DropdownMenu.Item asChild>
						<Link
							prefetch="intent"
							to={`/users/${username}`}
							className="rounded-b px-5 py-3 outline-none radix-highlighted:bg-night-500"
						>
							View profile
						</Link>
					</DropdownMenu.Item>

					{currentPermission === StoryPermissions.EditStory && (
						<DropdownMenu.Item asChild>
							<Form
								action={`/stories/${storyId}/settings`}
								method="POST"
								className="rounded-b px-5 py-3 outline-none radix-highlighted:bg-night-500"
								onClick={e => submit(e.currentTarget)}
							>
								<input name="storyId" type="hidden" value={storyId} />
								<input
									name="storyMemberUsername"
									type="hidden"
									value={username}
								/>
								<input
									name="permission"
									type="hidden"
									value={StoryPermissions.ReadStory}
								/>
								<input
									name="operation"
									type="hidden"
									value={StorySettingsOperations.Update}
								/>

								<button type="submit">Remove as editor</button>
							</Form>
						</DropdownMenu.Item>
					)}

					{currentPermission === StoryPermissions.ReadStory && (
						<DropdownMenu.Item asChild>
							<Form
								action={`/stories/${storyId}/settings`}
								method="POST"
								className="rounded-b px-5 py-3 outline-none radix-highlighted:bg-night-500"
								onClick={e => submit(e.currentTarget)}
							>
								<input name="storyId" type="hidden" value={storyId} />
								<input
									name="storyMemberUsername"
									type="hidden"
									value={username}
								/>
								<input
									name="permission"
									type="hidden"
									value={StoryPermissions.EditStory}
								/>
								<input
									name="operation"
									type="hidden"
									value={StorySettingsOperations.Update}
								/>

								<button type="submit">Make editor</button>
							</Form>
						</DropdownMenu.Item>
					)}

					<DropdownMenu.Separator className="m-[2px] h-[1px] bg-night-200" />
					<DropdownMenu.Item asChild>
						<Form
							action={`/stories/${storyId}/settings`}
							method="POST"
							className="rounded-b px-5 py-3 text-red-600 outline-none radix-highlighted:bg-night-500"
							onClick={e => submit(e.currentTarget)}
						>
							<input name="storyId" type="hidden" value={storyId} />
							<input
								name="storyMemberUsername"
								type="hidden"
								value={username}
							/>
							<input
								name="permission"
								type="hidden"
								value={currentPermission}
							/>
							<input
								name="operation"
								type="hidden"
								value={StorySettingsOperations.Remove}
							/>

							<button type="submit">Remove as reader</button>
						</Form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
