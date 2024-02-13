import { Navbar } from 'flowbite-react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'
import { UserDropdown, UserProfileButton } from '~/components/UserDropDown.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import { type User } from '@prisma/client'
import { owlIcon } from '~/routes/_marketing+/logos/logos.ts'
import { FaBook } from 'react-icons/fa/index.js'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { isBrowser } from '~/utils/browser-detection.ts'
import Xmark from '~/components/Xmark.tsx'
import { HamburgerMenu } from '~/components/HamburgerMenu.tsx'

type HeaderProps = {
	user: Pick<User, 'id' | 'username' | 'imageId' | 'name'> | null
}

const Header = function ({ user }: HeaderProps) {
	const location = isBrowser() ? window.location.pathname : '/'
	const vw = isBrowser()
		? Math.max(
				document.documentElement.clientWidth || 0,
				window.innerWidth || 0,
		  )
		: 0
	const { isOpenOnSmallScreens, isPageWithSidebar, setOpenOnSmallScreens } =
		useSidebarContext()
	const [isOpen, setOpen] = useState(false)

	// Close Sidebar on page change on mobile
	useEffect(() => {
		setOpen(false)
	}, [location])

	// Close Sidebar on mobile tap inside main content
	useEffect(() => {
		function handleMobileTapInsideMain(event: MouseEvent) {
			const mainContent = document.querySelector('#main-content')
			const isClickInsideMain = mainContent?.contains(event.target as Node)

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
		<header className="sticky top-0 z-20 w-full border-b-[1px] border-night-200">
			<div className="container mx-auto max-w-7xl">
				<Navbar fluid>
					{isPageWithSidebar && (
						<button
							aria-controls="sidebar"
							aria-expanded="true"
							className="mr-2 cursor-pointer rounded p-2 text-2xl text-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-gray-100 active:text-gray-900  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-color-primary dark:focus:bg-gray-700 dark:focus:ring-gray-700 md:hidden"
							onClick={() => setOpenOnSmallScreens(!isOpenOnSmallScreens)}
						>
							{isOpenOnSmallScreens ? <Xmark /> : <FaBook />}
						</button>
					)}
					<Navbar.Brand href="/">
						<img alt="Owl" height="30" src={owlIcon} width="30" />
						<span className="text-md hidden px-3 font-semibold dark:text-color-primary xs:flex sm:text-xl">
							Choose Your Own Adventure!
						</span>
					</Navbar.Brand>

					{/* Navbar hamburger-menu toggle for smaller screens*/}
					<button
						className="cursor-pointer rounded p-2 text-2xl text-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-gray-100 active:text-gray-900  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-color-primary dark:focus:bg-gray-700 dark:focus:ring-gray-700 md:hidden"
						onClick={() => setOpen(!isOpen)}
					>
						{isOpen ? <Xmark /> : <HamburgerMenu />}
					</button>

					{/* Navbar Collapsible section */}
					<div
						className={classNames('w-full md:block md:w-auto', {
							hidden: !isOpen,
						})}
					>
						<div className="my-4 flex flex-col space-y-6 md:my-0 md:flex-row md:gap-6 md:space-y-0">
							<ButtonLink color="secondary" to="/stories">
								Stories
							</ButtonLink>
							{user && (
								<ButtonLink gradientDuoTone="purpleToBlue" to="/stories/new">
									Write a Story
								</ButtonLink>
							)}
							{!user && (
								<ButtonLink color="secondary" to="/login">
									Log In
								</ButtonLink>
							)}
							{user ? (
								vw > 768 ? (
									<UserDropdown />
								) : (
									<UserProfileButton />
								)
							) : (
								<ButtonLink to="/signup" color="primary">
									Sign Up
								</ButtonLink>
							)}
						</div>
					</div>
				</Navbar>
			</div>
		</header>
	)
}

export default Header
