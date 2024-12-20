import { cssBundleHref } from '@remix-run/css-bundle'
import {
	type DataFunctionArgs,
	json,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import { DarkThemeToggle, Flowbite, ThemeModeScript } from 'flowbite-react'
import { StoryActivityProvider } from '~/context/story-activity-context.tsx'
import Header from './components/Header.tsx'
import { SidebarProvider } from './context/sidebar-context.tsx'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { authenticator, getUserId } from './utils/auth.server.ts'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { useNonce } from './utils/nonce-provider.ts'
import { customTheme } from './styles/customTheme.tsx'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/favicons/apple-touch-icon.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: '/favicons/favicon-32x32.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: '/favicons/favicon-16x16.png',
		},
		{ rel: 'manifest', href: '/site.webmanifest' },
		{ rel: 'icon', href: '/favicon.ico' },
		{ rel: 'stylesheet', href: '/fonts/nunito-sans/font.css' },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export const meta: MetaFunction = () => {
	return [
		{ title: 'Choose Your Own Adventure!' },
		{
			name: 'description',
			content:
				'Create or explore collaborative choose-your-own-adventure stories from every genre.',
		},
	]
}

export async function loader({ request }: DataFunctionArgs) {
	const userId = await getUserId(request)

	const user = userId
		? await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, name: true, username: true, imageId: true },
		  })
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated, but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await authenticator.logout(request, { redirectTo: '/' })
	}

	return json({
		user,
		ENV: getEnv(),
	})
}

export default function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const { user } = data
	return (
		<html lang="en">
			<head>
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<ThemeModeScript nonce={nonce} />
				<Links />
			</head>
			<Flowbite theme={{ theme: customTheme }}>
				<SidebarProvider>
					<body className="flex h-screen w-screen flex-col bg-white text-color-primary-inverted dark:bg-night-primary dark:text-color-primary">
						<Header user={user} />
						<div id="main-content" className="flex h-full w-full">
							<StoryActivityProvider>
								<Outlet />
							</StoryActivityProvider>
						</div>
						<div className="fixed bottom-0 right-0 p-2">
							<DarkThemeToggle />
						</div>
						<ScrollRestoration nonce={nonce} />
						<Scripts nonce={nonce} />
						<script
							nonce={nonce}
							dangerouslySetInnerHTML={{
								__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
							}}
						/>
						<LiveReload nonce={nonce} />
					</body>
				</SidebarProvider>
			</Flowbite>
		</html>
	)
}
