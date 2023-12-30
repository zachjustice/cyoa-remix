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
				'absolute top-0 z-10 h-full overflow-auto border-r-2 border-night-200 md:sticky md:!block',
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
