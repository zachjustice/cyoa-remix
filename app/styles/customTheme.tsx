import { type CustomFlowbiteTheme } from 'flowbite-react'

export const customTheme: CustomFlowbiteTheme = {
	navbar: {
		root: {
			base: 'bg-night-700 px-2 py-2.5 dark:border-gray-700 dark:bg-gray-800 sm:px-4',
			inner: {
				base: 'mx-auto flex flex-wrap items-center justify-between',
			},
		},
	},
	tabs: {
		tablist: {
			styles: {
				fullWidth:
					'w-full text-sm font-medium shadow grid grid-flow-col dark:divide-gray-700 dark:text-gray-400 rounded-none',
			},
			tabitem: {
				base: 'flex items-center justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:ring-1 focus:ring-accept-purple focus:outline-none',
				styles: {
					fullWidth: {
						base: 'ml-0 first:ml-0 w-full first:rounded-tl-lg last:rounded-tr-lg flex border-b-2 border-night-200',
						active: {
							on: 'active font-bold bg-night-500 hover:text-white dark:hover:text-white dark:bg-night-800 dark:hover:bg-night-700',
							off: 'p-4 text-white bg-night-400 hover:bg-night-500 dark:bg-night-700 dark:text-white',
						},
					},
				},
			},
		},
	},
	toggleSwitch: {
		root: {
			label: 'ml-3 text-sm font-medium text-white dark:text-gray-300',
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
				'h-full overflow-y-auto overflow-x-hidden rounded bg-night-700 pl-4 py-4 dark:bg-gray-800',
		},
		collapse: {
			list: 'space-y-2 py-2 list-none',
		},
		item: {
			base: 'no-underline flex items-center rounded-lg p-2 text-lg font-normal text-white hover:bg-accent-purple dark:text-white dark:hover:bg-gray-700',
		},
		itemGroup: {
			base: 'list-none border-t border-gray-200 pt-3 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700',
		},
	},
}
