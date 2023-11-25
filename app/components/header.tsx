import { type FC } from 'react'
import { Button, Navbar } from 'flowbite-react'
import { useSidebarContext } from '~/context/sidebar-context.tsx'
import { UserDropdown } from '~/components/UserDropDown.tsx'
import { Link } from '@remix-run/react'

const Header: FC<Record<string, never>> = function ({ user }) {
	const { isOpenOnSmallScreens, isPageWithSidebar, setOpenOnSmallScreens } =
		useSidebarContext()

	return (
		<header className="container sticky top-0 z-20 mx-auto max-w-7xl">
			<Navbar fluid rounded>
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
					{/* <img
                        alt="Flowbite logo"
                        height="24"
                        src="/favicon.png"
                        width="24"
                    /> */}
					<span className="whitespace-nowrap px-3 text-xl font-semibold dark:text-white">
						Choose Your Own Adventure!
					</span>
				</Navbar.Brand>
				<div className="md:order-2 md:hidden">
					<Navbar.Toggle />
				</div>
				<Navbar.Collapse>
					<Button color="default" href="/stories">
						Stories
					</Button>
					{user && (
						<Button as={Link} to="/stories/new" color="blue">
							Write a Story
						</Button>
					)}
					{!user && (
						<Button as={Link} to="/login" color="default">
							Log In
						</Button>
					)}
					{user ? (
						<UserDropdown />
					) : (
						<Button as={Link} to="/signup" color="blue">
							Sign Up
						</Button>
					)}
				</Navbar.Collapse>
			</Navbar>
		</header>
	)
}

export default Header
