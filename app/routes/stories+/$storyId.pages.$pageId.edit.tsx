import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { type ViewedPage } from '~/routes/stories+/$storyId.pages.$pageId.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { useParams } from '@remix-run/react'

export default function EditPageRoute() {
	const params = useParams()
	const { page, isOwner } = useMatchesData(
		`/stories/${params.storyId}/pages/${params.pageId}`,
	) as {
		page: ViewedPage
		isOwner: Boolean
	}

	return <PageEditor page={{ ...page, storyId: params.storyId }} />
}
