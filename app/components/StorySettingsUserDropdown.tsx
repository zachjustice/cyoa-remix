import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { PiDotsThreeCircleVerticalFill } from 'react-icons/pi/index.js'
import { Form, Link } from '@remix-run/react'
import { Simulate } from 'react-dom/test-utils'
import submit = Simulate.submit

export default function StorySettingsUserDropDown() {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div>
					<PiDotsThreeCircleVerticalFill className="ml-2 h-8 w-8 rounded-full hover:cursor-pointer hover:text-night-200" />
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className="flex flex-col rounded bg-[#323232]">
					<DropdownMenu.Item asChild>
						<Link
							prefetch="intent"
							to="/users"
							className="rounded-b px-5 py-3 outline-none radix-highlighted:bg-night-500"
						>
							View profile
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<Form
							action="/logout"
							method="POST"
							className="rounded-b px-5 py-3 outline-none radix-highlighted:bg-night-500"
							onClick={e => submit(e.currentTarget)}
						>
							<button type="submit">Remove as editor</button>
						</Form>
					</DropdownMenu.Item>
					<DropdownMenu.Separator className="m-[2px] h-[1px] bg-night-200" />
					<DropdownMenu.Item asChild>
						<Form
							action="/logout"
							method="POST"
							className="rounded-b px-5 py-3 text-red-600 outline-none radix-highlighted:bg-night-500"
							onClick={e => submit(e.currentTarget)}
						>
							<button type="submit">Remove as reader</button>
						</Form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
