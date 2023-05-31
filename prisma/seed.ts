import fs from 'fs'
import {faker} from '@faker-js/faker'
import {createPassword, createUser} from 'tests/db-utils.ts'
import {prisma} from '~/utils/db.server.ts'
import {deleteAllData} from 'tests/setup/utils.ts'
import {getPasswordHash} from '~/utils/auth.server.ts'

async function seed() {
    console.log('🌱 Seeding...')
    console.time(`🌱 Database has been seeded`)

    console.time('🧹 Cleaned up the database...')
    deleteAllData()
    console.timeEnd('🧹 Cleaned up the database...')

    console.time(`👑 Created admin role/permission...`)
    const adminRole = await prisma.role.create({
        data: {
            name: 'admin',
            permissions: {
                create: {name: 'admin'},
            },
        },
    })
    console.timeEnd(`👑 Created admin role/permission...`)
    // hosts with ships and reviews
    // renters with bookings and reviews
    // hosts who are renters also
    const totalUsers = 40
    console.time(`👤 Created ${totalUsers} users...`)
    const users = await Promise.all(
        Array.from({length: totalUsers}, async (_, index) => {
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
                    notes: {
                        create: Array.from({
                            length: faker.datatype.number({min: 0, max: 10}),
                        }).map(() => ({
                            title: faker.lorem.sentence(),
                            content: faker.lorem.paragraphs(),
                        })),
                    },
                },
            })
            return user
        }),
    )
    console.timeEnd(`👤 Created ${totalUsers} users...`)

    console.time(
        `🐨 Created user "kody" with the password "kodylovesyou" and admin role`,
    )
    const user = await prisma.user.create({
        data: {
            email: 'kody@kcd.dev',
            username: 'kody',
            name: 'Kody',
            roles: {connect: {id: adminRole.id}},
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
                    hash: await getPasswordHash('kodylovesyou'),
                },
            },
            notes: {
                create: [
                    {
                        title: 'Basic Koala Facts',
                        content:
                            'Koalas are found in the eucalyptus forests of eastern Australia. They have grey fur with a cream-coloured chest, and strong, clawed feet, perfect for living in the branches of trees!',
                    },
                    {
                        title: 'Koalas like to cuddle',
                        content:
                            'Cuddly critters, koalas measure about 60cm to 85cm long, and weigh about 14kg.',
                    },
                    {
                        title: 'Not bears',
                        content:
                            "Although you may have heard people call them koala 'bears', these awesome animals aren’t bears at all – they are in fact marsupials. A group of mammals, most marsupials have pouches where their newborns develop.",
                    },
                ],
            },
        },
    })
    console.timeEnd(
        `🐨 Created user "kody" with the password "kodylovesyou" and admin role`,
    )

    console.time(`📚 Created pages and choices...`)

    const page = await prisma.page.create({
        data: {
            owner: {connect: {id: user.id}},
            content: 'You wake in a forest surrounded by trees... What do you do?',
            nextChoices: {
                create: [
                    {
                        owner: {connect: {id: user.id}},
                        content: "Look around.",
                        nextPage: {
                            create: {
                                owner: {connect: {id: user.id}},
                                content: 'There is a path going north and south in front of you.',
                                nextChoices: {
                                    create: [
                                        {
                                            owner: {connect: {id: user.id}},
                                            content: 'Go North.',
                                        },
                                        {
                                            owner: {connect: {id: user.id}},
                                            content: 'Go South.',
                                        }

                                    ]
                                }
                            }
                        }
                    },
                    {
                        owner: {connect: {id: user.id}},
                        content: "Go back to sleep.",
                        nextPage: {
                            create: {
                                owner: {connect: {id: user.id}},
                                content: 'It is now late evening. As you wake up you notice someone staring at you- a small hobbit!',
                                nextChoices: {
                                    create: [
                                        {
                                            owner: {connect: {id: user.id}},
                                            content: 'Approach the small hobbit and introduce yourself'
                                        },
                                        {
                                            owner: {connect: {id: user.id}},
                                            content: 'Run away.'
                                        },
                                        {
                                            owner: {connect: {id: user.id}},
                                            content: 'Go back to sleep.'
                                        },
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        },
    })

    await prisma.story.create({
        data: {
            owner: {connect: {id: user.id}},
            title: 'The Drugar\'s Fable',
            description: 'A story in which you journey through far-off lands, kiss a prince, and marry a dragon.',
            firstPage: {connect: {id: page.id}}
        }
    })

    await prisma.story.create({
        data: {
            owner: {connect: {id: user.id}},
            title: 'A Space Odyssey',
            description: 'The space frigate, Meritocracy, has encountered an unknown alien species... and they\'re ready to smooch',
        }
    })

    await prisma.story.create({
        data: {
            owner: {connect: {id: user.id}},
            title: 'Wizard Academy',
            description: 'You and your arch-rival are destined by prophecy to fight to the death or fall in love trying.',
        }
    })

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
