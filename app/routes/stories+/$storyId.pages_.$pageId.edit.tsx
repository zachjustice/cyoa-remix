import { PageEditor } from '~/routes/resources+/page-editor.tsx'
import { type ViewedPage } from '~/routes/stories+/$storyId.pages.$pageId.tsx'
import { useMatchesData } from '~/hooks/useMatchesData.ts'
import { useLoaderData, useParams } from '@remix-run/react'
import { Edit } from '@sinclair/typebox/value'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { getUserId } from '~/utils/auth.server.ts'
import invariant from 'tiny-invariant'
import { prisma } from '~/utils/db.server.ts'

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	invariant(params.storyId, 'Missing storyId')
	invariant(params.pageId, 'Missing pageId')

	const page = await prisma.page.findUnique({
		where: { id: params.pageId },
		select: {
			id: true,
			content: true,
			ownerId: true,
		},
	})

	if (!page) {
		throw new Response('not found', { status: 404 })
	}
	return json({
		page,
		isOwner: page.ownerId === userId,
	})
}

export default function EditPageRoute() {
	const params = useParams()
	const { page } = useLoaderData<typeof loader>()

	return <PageEditor page={{ ...page, storyId: params.storyId }} />
}
