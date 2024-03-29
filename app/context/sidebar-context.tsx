import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { isBrowser, isSmallScreen } from '~/utils/browser-detection.ts'

interface SidebarContextProps {
	isPageWithSidebar: boolean
	isOpenOnSmallScreens: boolean
	setOpenOnSmallScreens: (to: boolean) => void
	setHasSidebar: (isPageWithSidebar: boolean) => void
}

const SidebarContext = createContext<SidebarContextProps>({
	isPageWithSidebar: false,
	isOpenOnSmallScreens: false,
	setOpenOnSmallScreens: () => undefined,
	setHasSidebar: () => undefined,
})

export function SidebarProvider({
	children,
}: PropsWithChildren<Record<string, unknown>>) {
	const location = isBrowser() ? window.location.pathname : '/'
	const [isOpen, setOpen] = useState(false)
	const [isPageWithSidebar, setHasSidebar] = useState(false)

	// Close Sidebar on page change on mobile
	useEffect(() => {
		if (isSmallScreen()) {
			setOpen(false)
		}
	}, [location])

	// Close Sidebar on mobile tap inside main content
	useEffect(() => {
		function handleMobileTapInsideMain(event: MouseEvent) {
			const main = document.querySelector('main')
			const isClickInsideMain = main?.contains(event.target as Node)

			if (isClickInsideMain) {
				setOpen(false)
			}
		}

		document.addEventListener('mousedown', handleMobileTapInsideMain)
		return () => {
			document.removeEventListener('mousedown', handleMobileTapInsideMain)
		}
	}, [])

	return (
		<SidebarContext.Provider
			value={{
				isOpenOnSmallScreens: isOpen,
				isPageWithSidebar: isPageWithSidebar,
				setHasSidebar: setHasSidebar,
				setOpenOnSmallScreens: setOpen,
			}}
		>
			{children}
		</SidebarContext.Provider>
	)
}

export function useSidebarContext(): SidebarContextProps {
	const context = useContext(SidebarContext)

	if (!context) {
		throw new Error(
			'useSidebarContext should be used within the SidebarContext provider!',
		)
	}

	return context
}
