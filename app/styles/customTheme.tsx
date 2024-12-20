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
			base: 'px-2 py-2.5 sm:px-4 ',
			inner: {
				base: 'mx-auto flex flex-wrap items-center justify-between',
			},
		},
	},
	tabs: {
		base: 'flex flex-1 w-full flex-col pb-10',
		tabpanel: '',
		tablist: {
			base: 'flex flex-col md:flex-row text-center gap-4',
			styles: {
				fullWidth:
					'w-full text-sm font-medium shadow grid grid-flow-col dark:divide-gray-700 dark:text-gray-400 rounded-none',
				pills:
					'overflow-x-auto sm:flex-wrap bg-day-primary-highlight border rounded-t border-day-border dark:border-night-border p-4 text-gray-500 dark:text-dark-subtitle dark:bg-night-primary-highlight space-x-2',
			},
			tabitem: {
				base: 'items-center whitespace-nowrap justify-center p-4 text-sm font-medium leading-[0] first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:ring-1 focus:ring-accept-yellow focus:outline-none',
				styles: {
					pills: {
						base: '',
						active: {
							on: 'rounded-lg border border-accent-primary bg-accent-primary text-color-primary',
							off: 'rounded-lg border border-day-border dark:border-night-border hover:border-accent-primary',
						},
					},
					fullWidth: {
						base: 'ml-0 first:ml-0 w-full first:rounded-t-lg last:rounded-tr-lg flex border-b-2 border-day-border dark:border-night-border',
						active: {
							on: 'active font-bold bg-accent-primary hover:text-color-primary dark:hover:text-color-primary dark:bg-night-800 dark:hover:bg-accent-primary',
							off: 'p-4 text-color-primary bg-accent-primary-muted hover:bg-accent-primary dark:bg-night-primary dark:text-color-primary',
						},
					},
				},
			},
		},
	},
	toggleSwitch: {
		root: {
			label: 'ml-3 text-sm font-medium text-color-primary dark:text-gray-300',
		},
	},
	button: {
		base: 'group flex items-stretch items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none',
		color: {
			default:
				'border-[1px] border-day-border focus:bg-gray-100 hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-color-primary dark:border-night-border dark:bg-night-primary',
			secondary:
				'border-[1px] border-night-400 dark:bg-night-primary hover:border-accent-primary focus:border-accent-primary active:border-accent-primary-lighter focus:bg-gray-100 hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-night-700 dark:hover:text-color-primary',
			primary:
				'text-color-primary border border-transparent focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 bg-accent-primary hover:bg-accent-secondary hover:text-color-primary-inverted focus:bg-accent-secondary focus:text-color-primary-inverted active:bg-accent-secondary-muted',
			danger:
				'bg-accent-alert hover:bg-accent-secondary hover:text-color-primary-inverted focus:bg-accent-secondary focus:text-color-primary-inverted active:bg-accent-secondary-muted',
		},
		inner: {
			base: 'flex items-center transition-all duration-200',
		},
		size: {
			xs: 'text-xs leading-[0.5rem] px-2 py-1',
			sm: 'text-sm leading-[0.5rem] px-3 py-1.5',
			md: 'text-sm leading-[1rem] px-4 py-2',
			lg: 'text-base leading-[1rem] px-5 py-2.5',
			xl: 'text-base leading-[1rem] px-6 py-3',
		},
	},
	sidebar: {
		root: {
			base: 'h-full overflow-y-auto overflow-x-visible ',
			inner: 'flex flex-col',
		},
		collapse: {
			list: 'space-y-2 py-2 list-none',
		},
		item: {
			base: 'no-underline flex items-center rounded-lg p-2 text-lg font-normal text-color-primary hover:bg-accent-primary dark:text-color-primary dark:hover:bg-gray-700',
		},
		itemGroup: {
			base: 'flex flex-col list-none pt-3 first:mt-0 first:pt-0 last:mb-6',
		},
	},
}
