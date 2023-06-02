import {useFetcher} from "@remix-run/react";
import {useState} from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import {clsx} from "clsx";

export function ThemeSwitch() {
    const fetcher = useFetcher()
    const [mode, setMode] = useState<'system' | 'dark' | 'light'>('system')
    const checked: boolean | 'indeterminate' =
        mode === 'system' ? 'indeterminate' : mode === 'dark'
    const theme = mode === 'system' ? 'dark' : mode
    return (
        <fetcher.Form>
            <label>
                <Checkbox.Root
                    className={clsx('bg-gray-night-500 h-10 w-20 rounded-full p-1', {
                        'bg-night-500': theme === 'dark',
                        'bg-white': theme === 'light',
                    })}
                    checked={checked}
                    name="theme"
                    value={mode}
                    onCheckedChange={() =>
                        setMode(oldMode =>
                            oldMode === 'system'
                                ? 'light'
                                : oldMode === 'light'
                                    ? 'dark'
                                    : 'system',
                        )
                    }
                    aria-label={
                        mode === 'system'
                            ? 'System Theme'
                            : mode === 'dark'
                                ? 'Dark Theme'
                                : 'Light Theme'
                    }
                >
					<span
                        className={clsx('flex justify-between rounded-full', {
                            'bg-white': mode === 'system' && theme === 'dark',
                            'theme-switch-light': mode === 'system' && theme === 'light',
                        })}
                    >
						<span
                            className={clsx(
                                'theme-switch-light',
                                'flex h-8 w-8 items-center justify-center rounded-full',
                                {
                                    'text-white': mode === 'light',
                                },
                            )}
                        >
							🔆
						</span>
						<span
                            className={clsx(
                                'theme-switch-dark',
                                'flex h-8 w-8 items-center justify-center rounded-full',
                                {
                                    'text-white': mode === 'dark',
                                },
                            )}
                        >
							🌙
						</span>
					</span>
                </Checkbox.Root>
            </label>
        </fetcher.Form>
    )
}
