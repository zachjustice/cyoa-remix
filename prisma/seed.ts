import fs from 'fs'
import { parseTestData } from 'prisma/data-generators.ts'
import { testData } from 'prisma/testData.js'
import { createPassword, createUser } from 'tests/db-utils.ts'
import { prisma } from '~/utils/db.server.ts'
import { deleteAllData } from 'tests/setup/utils.ts'
import { getPasswordHash } from '~/utils/auth.server.ts'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	deleteAllData()
	console.timeEnd('🧹 Cleaned up the database...')

	console.time(`👑 Created Admin role...`)
	const adminRole = await prisma.role.create({
		data: {
			name: 'admin',
		},
	})
	console.time(`👑 Created Admin role...`)

	console.time(`👑 Created read and edit permission...`)
	const readStoryPermission = await prisma.permission.create({
		data: {
			name: 'story/read',
		},
	})

	const editStoryPermission = await prisma.permission.create({
		data: {
			name: 'story/edit',
		},
	})
	console.timeEnd(`👑 Created read and edit permission...`)

	const totalUsers = 5
	console.time(`👤 Created ${totalUsers} users...`)
	const users = await Promise.all([
		await prisma.user.create({
			data: {
				email: 'zach@zachjustice.dev',
				username: 'zach',
				name: 'Zach Justice',
				image: {
					create: {
						contentType: 'image/png',
						file: {
							create: {
								blob: await fs.promises.readFile(
									'./tests/fixtures/images/user/kody.png',
								),
							},
						},
					},
				},
				password: {
					create: {
						hash: await getPasswordHash('zachlovesyou'),
					},
				},
			},
		}),
		...Array.from({ length: totalUsers }, async (_, index) => {
			const userData = createUser()
			const user = await prisma.user.create({
				data: {
					...userData,
					password: {
						create: createPassword(userData.username),
					},
					image: {
						create: {
							contentType: 'image/jpeg',
							file: {
								create: {
									blob: await fs.promises.readFile(
										`./tests/fixtures/images/user/${index % 10}.jpg`,
									),
								},
							},
						},
					},
				},
			})
			return user
		}),
	])
	console.timeEnd(`👤 Created ${totalUsers} users...`)

	const user = users[0]
	console.log(`🐨 Created user "zach" with the password "zachlovesyou"`)

	console.time(`📚 Created pages and choices...`)

	let userNum = 0
	for (let storyNum = 0; storyNum < testData.length; storyNum++) {
		const { text, storyTitle, storyDescription } = testData[storyNum]
		const parsedData = parseTestData(text, { connect: { id: user.id } })
		const generatedPage = await prisma.page.create({
			data: parsedData,
		})

		await prisma.story.create({
			data: {
				owner: { connect: { id: users[userNum++ % users.length].id } },
				title: storyTitle,
				description: storyDescription,
				firstPage: { connect: { id: generatedPage.id } },
				isPublic: storyNum < 3, // first 3 stories are private
				storyMembers: {
					create: [
						{
							user: {
								connect: { id: users[(userNum + 1) % users.length].id },
							},
							permission: {
								connect: { id: editStoryPermission.id },
							},
						},
						{
							user: {
								connect: { id: users[(userNum + 2) % users.length].id },
							},
							permission: {
								connect: { id: readStoryPermission.id },
							},
						},
						{
							user: {
								connect: { id: users[(userNum + 3) % users.length].id },
							},
							permission: {
								connect: { id: readStoryPermission.id },
							},
						},
					],
				},
			},
		})
	}

	console.timeEnd(`📚 Created pages and choices...`)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
