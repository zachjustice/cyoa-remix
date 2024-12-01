import classNames from 'classnames'
import { Sidebar as FlowbiteSidebar, type SidebarProps } from 'flowbite-react'
import type { FC } from 'react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'
import { useEffect } from 'react'

const Sidebar: FC<SidebarProps> = function ({ children, className }) {
	const { isOpenOnSmallScreens: isSidebarOpenOnSmallScreens, setHasSidebar } =
		useSidebarContext()

	useEffect(() => {
		setHasSidebar(true)

		return () => {
			setHasSidebar(false)
		}
	}, [setHasSidebar])

	return (
		<div
			className={classNames(
				'border-day-border absolute absolute top-0 z-10 flex h-full flex-col border-r-[1px] bg-day-primary dark:border-night-border dark:bg-night-primary md:sticky md:!block',
				{
					hidden: !isSidebarOpenOnSmallScreens,
				},
			)}
		>
			<FlowbiteSidebar className={className}>{children}</FlowbiteSidebar>
		</div>
	)
}

export default Object.assign(Sidebar, { ...FlowbiteSidebar })
