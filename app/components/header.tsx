import { Navbar } from 'flowbite-react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'
import { UserDropdown } from '~/components/UserDropDown.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import { type User } from '@prisma/client'
import { owlIcon } from '~/routes/_marketing+/logos/logos.ts'
import { FaBook } from 'react-icons/fa/index.js'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { isBrowser } from '~/utils/browser-detection.ts'

type HeaderProps = {
	user: Pick<User, 'id' | 'username' | 'imageId' | 'name'> | null
}

const Header = function ({ user }: HeaderProps) {
	const location = isBrowser() ? window.location.pathname : '/'
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
		<header className="sticky top-0 z-20 w-full border-b-2 border-night-400 bg-night-700">
			<div className="container mx-auto max-w-7xl">
				<Navbar fluid>
					{isPageWithSidebar && (
						<button
							aria-controls="sidebar"
							aria-expanded="true"
							className="mr-2 cursor-pointer rounded p-2 text-2xl text-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-gray-100 active:text-gray-900  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700 md:hidden"
							onClick={() => setOpenOnSmallScreens(!isOpenOnSmallScreens)}
						>
							{!isOpenOnSmallScreens ? (
								<FaBook />
							) : (
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									></path>
								</svg>
							)}
						</button>
					)}
					<Navbar.Brand href="/">
						<img alt="Owl" height="30" src={owlIcon} width="30" />
						<span className="text-md hidden px-3 font-semibold dark:text-white xs:flex sm:text-xl">
							Choose Your Own Adventure!
						</span>
					</Navbar.Brand>

					{/* Navbar hamburger-menu toggle for smaller screens*/}
					<button
						className="cursor-pointer rounded p-2 text-2xl text-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-gray-100 active:text-gray-900  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700 md:hidden"
						onClick={() => setOpen(!isOpen)}
					>
						{isOpen ? (
							<svg
								className="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						) : (
							<svg
								stroke="currentColor"
								fill="currentColor"
								stroke-width="0"
								viewBox="0 0 448 512"
								aria-hidden="true"
								className="h-6 w-6 shrink-0"
								height="1em"
								width="1em"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
							</svg>
						)}
					</button>

					{/* Navbar Collapsible section */}
					<div
						className={classNames('w-full md:block md:w-auto', {
							hidden: !isOpen,
						})}
					>
						<div className="mt-4 flex flex-col space-y-6 md:mt-0 md:flex-row md:gap-6 md:space-y-0">
							<ButtonLink color="default" to="/stories">
								Stories
							</ButtonLink>
							{user && (
								<ButtonLink gradientDuoTone="purpleToBlue" to="/stories/new">
									Write a Story
								</ButtonLink>
							)}
							{!user && <ButtonLink to="/login">Log In</ButtonLink>}
							{user ? (
								<UserDropdown />
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
