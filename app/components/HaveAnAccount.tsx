import { Link } from '@remix-run/react'
import React from 'react'

export function HaveAnAccount() {
	return (
		<>
			<span className="dark:text-color-subtitle">Already have an account?</span>
			<Link
				to="/login"
				className="text-accent-primary underline dark:text-white"
			>
				Log in
			</Link>
		</>
	)
}
