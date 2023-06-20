import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { type loader } from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.tsx'

export default function EditPageRoute() {
	const location = useLocation()
	const fetcher = useFetcher<typeof loader>()

	const path = location.pathname?.replace('/edit', '')

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data == null) {
			fetcher.load(`${path}?index`)
		}
	}, [path, fetcher])

	const { page, storyId, isOwner } = fetcher.data ?? {}

	if (!isOwner) return null
	if (!page) return null

	return <PageEditor page={{ ...page, storyId }} />
}
