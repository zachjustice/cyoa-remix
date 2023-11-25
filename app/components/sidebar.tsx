import classNames from 'classnames'
import { Sidebar as FlowbiteSidebar } from 'flowbite-react'
import type { FC, PropsWithChildren } from 'react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'

const Sidebar: FC<PropsWithChildren<Record<string, unknown>>> = function ({
	children,
}) {
	const { isOpenOnSmallScreens: isSidebarOpenOnSmallScreens } =
		useSidebarContext()

	return (
		<div
			className={classNames(
				'fixed top-0 z-10 h-screen overflow-auto lg:sticky lg:!block',
				{
					hidden: !isSidebarOpenOnSmallScreens,
				},
			)}
		>
			<FlowbiteSidebar>{children}</FlowbiteSidebar>
		</div>
	)
}

export default Object.assign(Sidebar, { ...FlowbiteSidebar })
