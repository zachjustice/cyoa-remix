import classNames from 'classnames'
import { Sidebar as FlowbiteSidebar, type SidebarProps } from 'flowbite-react'
import type { FC } from 'react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'

const Sidebar: FC<SidebarProps> = function ({ children, className }) {
	const { isOpenOnSmallScreens: isSidebarOpenOnSmallScreens } =
		useSidebarContext()

	return (
		<div
			className={classNames(
				'fixed z-10 h-screen overflow-auto lg:sticky lg:!block',
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
