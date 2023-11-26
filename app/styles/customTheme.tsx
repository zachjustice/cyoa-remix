import { type CustomFlowbiteTheme } from 'flowbite-react'

export const customTheme: CustomFlowbiteTheme = {
	navbar: {
		root: {
			base: 'bg-night-700 px-2 py-2.5 dark:border-gray-700 dark:bg-gray-800 sm:px-4',
		},
	},
	button: {
		color: {
			default:
				'border-[1.5px] border-night-400 bg-night-700 hover:border-accent-purple focus:border-accent-purple active:border-accent-purple-lighter',
			secondary:
				'border-[1.5px] border-night-400 bg-night-700 hover:border-accent-purple focus:border-accent-purple active:border-accent-purple-lighter',
			primary:
				'text-white border border-transparent focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 bg-accent-purple hover:bg-accent-yellow hover:text-night-700 focus:bg-accent-yellow focus:text-night-700 active:bg-accent-yellow-muted',
			danger:
				'bg-accent-red hover:bg-accent-yellow hover:text-night-700 focus:bg-accent-yellow focus:text-night-700 active:bg-accent-yellow-muted',
		},
	},
	sidebar: {
		root: {
			base: 'h-full bg-night-700',
			inner:
				'h-full overflow-y-auto overflow-x-hidden rounded bg-night-700 py-4 px-3 dark:bg-gray-800',
		},
		collapse: {
			list: 'space-y-2 py-2 list-none',
		},
		item: {
			base: 'no-underline flex items-center rounded-lg p-2 text-lg font-normal text-white hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700',
		},
		itemGroup: {
			base: 'list-none border-t border-gray-200 pt-3 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700',
		},
	},
}
