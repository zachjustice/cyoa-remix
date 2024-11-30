import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Form, Link, useSubmit } from '@remix-run/react'
import { getUserImgSrc } from '~/utils/misc.ts'
import { useUser } from '~/hooks/useUser.ts'
import { customTheme } from '~/styles/customTheme.tsx'
import { clsx } from 'clsx'

export function UserProfileButton() {
	const user = useUser()
	return (
		<Link
			to={`/users/${user.username}`}
			// this is for progressive enhancement
			className={clsx(
				customTheme.button?.base,
				customTheme.button?.color?.secondary,
				'rounded-lg',
			)}
		>
			<span className={clsx(customTheme.button?.inner?.base, 'px-2')}>
				<img
					className={clsx('mr-2 h-8 w-8 rounded-full object-cover', {
						'dark:bg-night-400': !user.imageId,
					})}
					alt={user.name ?? user.username}
					src={getUserImgSrc(user.imageId)}
				/>
				<span className="text-body-sm font-bold">
					{user.name ?? user.username}
				</span>
			</span>
		</Link>
	)
}

export function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<UserProfileButton />
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					sideOffset={8}
					align="start"
					className="border-day-border flex flex-col rounded-xl border-[1px] dark:border-night-border"
				>
					<DropdownMenu.Item asChild>
						<Link
							prefetch="intent"
							to={`/users/${user.username}`}
							className="rounded-t-xl bg-white px-7 py-5 outline-none radix-highlighted:bg-day-300 dark:bg-night-primary dark:radix-highlighted:bg-night-500"
						>
							Profile
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<Form
							action="/logout"
							method="POST"
							className="rounded-b-xl bg-white px-7 py-5 outline-none radix-highlighted:bg-day-300 dark:bg-night-primary dark:radix-highlighted:bg-night-500"
							onClick={e => submit(e.currentTarget)}
						>
							<button type="submit">Logout</button>
						</Form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
