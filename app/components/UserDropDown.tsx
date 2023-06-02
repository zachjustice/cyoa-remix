import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Form, Link, useSubmit} from "@remix-run/react";
import {getUserImgSrc} from "~/utils/misc.ts";
import {useUser} from "~/hooks/useUser.ts";

export function UserDropdown() {
    const user = useUser()
    const submit = useSubmit()
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Link
                    to={`/users/${user.username}`}
                    // this is for progressive enhancement
                    onClick={e => e.preventDefault()}
                    className="flex items-center gap-2 rounded-full bg-night-500 py-2 pl-2 pr-4 outline-none hover:bg-night-400 focus:bg-night-400 radix-state-open:bg-night-400"
                >
                    <img
                        className="h-8 w-8 rounded-full object-cover"
                        alt={user.name ?? user.username}
                        src={getUserImgSrc(user.imageId)}
                    />
                    <span className="text-body-sm font-bold">
						{user.name ?? user.username}
					</span>
                </Link>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    sideOffset={8}
                    align="start"
                    className="flex flex-col rounded-3xl bg-[#323232]"
                >
                    <DropdownMenu.Item asChild>
                        <Link
                            prefetch="intent"
                            to={`/users/${user.username}`}
                            className="rounded-t-3xl px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500"
                        >
                            Profile
                        </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                        <Link
                            prefetch="intent"
                            to={`/users/${user.username}/notes`}
                            className="px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500"
                        >
                            Notes
                        </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                        <Form
                            action="/logout"
                            method="POST"
                            className="rounded-b-3xl px-7 py-5 outline-none radix-highlighted:bg-night-500"
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
