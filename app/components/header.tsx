import { Navbar } from 'flowbite-react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'
import { UserDropdown } from '~/components/UserDropDown.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import { type User } from '@prisma/client'
import { owlIcon } from '~/routes/_marketing+/logos/logos.ts'

type HeaderProps = {
	user: Pick<User, 'id' | 'username' | 'imageId' | 'name'> | null
}

const Header = function ({ user }: HeaderProps) {
	const { isOpenOnSmallScreens, isPageWithSidebar, setOpenOnSmallScreens } =
		useSidebarContext()

	return (
		<header className="sticky top-0 z-20 w-full border-b-2 border-night-400 bg-night-700">
			<div className="container mx-auto max-w-7xl">
				<Navbar fluid>
					{isPageWithSidebar && (
						<button
							aria-controls="sidebar"
							aria-expanded="true"
							className="mr-2 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700 lg:hidden"
							onClick={() => setOpenOnSmallScreens(!isOpenOnSmallScreens)}
						>
							{isOpenOnSmallScreens ? (
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
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
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
					<Navbar.Toggle />
					<Navbar.Collapse>
						<div className="flex flex-col space-y-6 md:flex-row md:gap-6 md:space-y-0">
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
					</Navbar.Collapse>
				</Navbar>
			</div>
		</header>
	)
}

export default Header
