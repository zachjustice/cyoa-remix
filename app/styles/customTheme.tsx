import { type CustomFlowbiteTheme } from 'flowbite-react'

export const customTheme: CustomFlowbiteTheme = {
	accordion: {
		title: {
			base: 'flex w-full items-center justify-between first:rounded-t-lg last:rounded-b-lg py-5 px-5 text-left font-medium text-gray-500 dark:text-gray-400',
			flush: {
				off: 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-800',
				on: 'bg-transparent dark:bg-transparent',
			},
		},
	},
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
			base: 'flex text-center',
			styles: {
				fullWidth:
					'w-full text-sm font-medium shadow grid grid-flow-col dark:divide-gray-700 dark:text-gray-400 rounded-none',
				pills:
					'overflow-x-auto sm:flex-wrap border-t border-b border-night-400 py-2 font-medium text-sm text-gray-500 dark:text-gray-400 space-x-2',
			},
			tabitem: {
				base: 'items-center whitespace-nowrap justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:ring-1 focus:ring-accept-yellow focus:outline-none',
				styles: {
					pills: {
						base: '',
						active: {
							on: 'rounded-lg border border-night-400 bg-accent-purple text-white',
							off: 'rounded-lg border border-night-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white',
						},
					},
					fullWidth: {
						base: 'ml-0 first:ml-0 w-full first:rounded-tl-lg last:rounded-tr-lg flex border-b-2 border-night-200',
						active: {
							on: 'active font-bold bg-accent-purple hover:text-white dark:hover:text-white dark:bg-night-800 dark:hover:bg-accent-purple',
							off: 'p-4 text-white bg-accent-purple-muted hover:bg-accent-purple dark:bg-night-700 dark:text-white',
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
