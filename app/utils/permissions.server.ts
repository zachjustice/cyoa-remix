import { json } from '@remix-run/node'
import { requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'
import { StoryPermissions } from '~/routes/stories+/$storyId.settings.tsx'

export async function requireUserWithPermission(
	name: string,
	request: Request,
) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		where: { id: userId, roles: { some: { permissions: { some: { name } } } } },
	})
	if (!user) {
		throw json({ error: 'Unauthorized', requiredRole: name }, { status: 403 })
	}
	return user
}

export async function requireAdmin(request: Request) {
	return requireUserWithPermission('admin', request)
}

export async function isUserPermitted(
	permissions: StoryPermissions[],
	storyId: string,
	userId: string | null | undefined,
) {
	if (!userId) {
		return false
	}

	const storyMember = await prisma.storyMember.findFirst({
		where: {
			storyId: storyId,
			userId: userId,
		},
		select: {
			permission: {
				select: {
					name: true,
				},
			},
		},
	})

	return (
		storyMember?.permission.name &&
		permissions.includes(storyMember?.permission.name)
	)
}

export async function requireUserPermission(
	permissions: StoryPermissions[],
	storyId: string,
	userId: string | null | undefined,
) {
	if (!(await isUserPermitted(permissions, storyId, userId))) {
		throw json({ error: 'Unauthorized' }, { status: 403 })
	}
}

export async function requireStoryEditor(
	storyId: string,
	userId: string | null | undefined,
) {
	if (!(await isStoryOwner(storyId, userId))) {
		return requireUserPermission([StoryPermissions.EditStory], storyId, userId)
	}
}

export async function requireStoryReader(
	storyId: string,
	userId: string | null | undefined,
) {
	return requireUserPermission(
		[StoryPermissions.ReadStory, StoryPermissions.EditStory],
		storyId,
		userId,
	)
}

export async function isStoryOwner(
	storyId: string,
	userId: string | null | undefined,
) {
	if (!userId) {
		return false
	}

	const story = await prisma.story.findUnique({
		where: {
			id: storyId,
		},
		select: {
			ownerId: true,
		},
	})

	if (!story) {
		throw new Response('not found', { status: 404 })
	}

	return story.ownerId === userId
}
