import { conform, type FieldConfig, list, type Submission, useFieldList, useFieldset, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink, ErrorList, SimpleField, TextareaField } from '~/utils/forms.tsx'
import { requireStoryEditor } from '~/utils/permissions.server.ts'
import { useRef } from "react";
import { type ViewedChoice } from "~/routes/stories+/$storyId.pages.$pageId.tsx";
import { FaMinusCircle } from "react-icons/fa/index.js";
import { BsArrowReturnRight } from "react-icons/bs/index.js";

const ChoiceSchema = z.object({
    id: z.string().optional(),
    content: z.string(),
    nextPageId: z.string().optional(),
})

export const PageEditorSchema = z.object({
    id: z.string().optional(),
    pageContent: z.string().min(1),
    parentChoiceId: z.string().optional(),
    storyId: z.string(),
    choices: z.array(ChoiceSchema).optional(),
})

async function createOrSavePage(
    pageContent: string,
    pageId: string | undefined,
    parentChoiceId: string | undefined,
    storyId: string,
    choices: z.infer<typeof ChoiceSchema>[] | undefined,
    userId: string,
    submission: Submission
): Promise<string> {
    if (pageId) {
        const existingPage = await prisma.page.findFirst({
            where: { id: pageId },
            select: {
                id: true,
                nextChoices: {
                    select: {
                        id: true,
                        content: true,
                        nextPageId: true,
                    }
                }
            },
        })

        if (!existingPage) {
            throw json(
                {
                    status: 'error',
                    submission,
                } as const,
                { status: 404 },
            )
        }

        const choiceIdsToKeep = (choices || []).map(c => c.id)
        const choiceIdsToDelete = existingPage.nextChoices
            .map(c => c.id)
            .filter(existingId => !choiceIdsToKeep.includes(existingId))
            .map(idToDelete => ({
                id: idToDelete
            }))

        await prisma.page.update({
            where: { id: pageId },
            select: { id: true },
            data: {
                content: pageContent,
                nextChoices: {
                    deleteMany: choiceIdsToDelete,
                }
            },
        })

        return pageId
    }

    if (parentChoiceId) {
        // not the first page in a story
        const choice = await prisma.choice.update({
            where: { id: parentChoiceId },
            select: {
                nextPageId: true,
            },
            data: {
                nextPage: {
                    create: {
                        owner: { connect: { id: userId } },
                        content: pageContent,
                    },
                },
            },
        })

        invariant(choice?.nextPageId, `Failed to update choice ${parentChoiceId}`)
        return choice.nextPageId
    }

    // first page in a story
    const existingStory = await prisma.story.findFirst({
        where: { id: storyId },
        select: { firstPageId: true },
    })

    if (existingStory?.firstPageId) {
        throw json(
            {
                status: 'error',
                submission,
            } as const,
            { status: 400 },
        )
    }

    const story = await prisma.story.update({
        where: { id: storyId },
        select: {
            firstPageId: true,
        },
        data: {
            firstPage: {
                create: {
                    owner: { connect: { id: userId } },
                    content: pageContent,
                },
            },
        },
    })

    invariant(
        story.firstPageId,
        `Failed to update first page on story ${storyId}`,
    )

    return story.firstPageId
}

export async function action({ request }: DataFunctionArgs) {
    const userId = await requireUserId(request)
    const formData = await request.formData()

    const submission = parse(formData, {
        schema: PageEditorSchema,
    })

    if (submission.intent !== 'submit') {
        return json({ status: 'idle', submission } as const)
    }

    if (!submission.value) {
        return json(
            {
                status: 'error',
                submission,
            } as const,
            { status: 400 },
        )
    }

    const { pageContent, id, parentChoiceId, storyId, choices } = submission.value
    const pageId = await createOrSavePage(
        pageContent,
        id,
        parentChoiceId,
        storyId,
        choices,
        userId,
        submission
    )

    await requireStoryEditor(storyId, userId)

    // Update Choices
    for (const { id: choiceId, content, nextPageId } of (choices || [])) {
        if (choiceId) {
            await prisma.choice.update({
                where: { id: choiceId },
                data: {
                    content,
                    nextPage: (nextPageId ? { connect: { id: nextPageId } } : { disconnect: true }),
                }
            })
        } else {
            await prisma.page.update({
                where: { id: pageId },
                data: {
                    nextChoices: {
                        create: {
                            content,
                            owner: { connect: { id: userId } },
                            nextPage: (nextPageId ? { connect: { id: nextPageId } } : undefined),
                        }
                    }
                }
            })
        }
    }

    if (id) {
        // Saving changes on a pre-existing page; stay on the page
        return json({
            status: 'success',
            submission
        })
    } else {
        // Creating a new page; redirect to the new page
        return redirect(`/stories/${storyId}/pages/${pageId}/`)
    }
}

type PageEditorProps = {
    page: {
        id?: string
        content?: string
        parentChoiceId?: string
        storyId?: string
        nextChoices?: ViewedChoice[] | null
    }
    canDeletePage: boolean
}

export function PageEditor(props: PageEditorProps) {
    const { page, canDeletePage } = props
    const pageEditorFetcher = useFetcher<typeof action>()

    const [ form, fields ] = useForm({
        id: 'page-editor',
        constraint: getFieldsetConstraint(PageEditorSchema),
        lastSubmission: pageEditorFetcher.data?.submission,
        onValidate({ formData }) {
            return parse(formData, { schema: PageEditorSchema })
        },
        defaultValue: {
            pageContent: page?.content,
            choices: page?.nextChoices,
        },
        shouldRevalidate: 'onBlur',
    })
    const choices = useFieldList(form.ref, fields.choices)

    let prompt: string
    if (page?.content) {
        prompt = 'Edit the page...'
    } else if (page?.parentChoiceId) {
        prompt = 'Write the next page...'
    } else {
        prompt = 'Write the first page...'
    }

    const Subtitle = ({ children }: {children: React.ReactNode}) => <h2 className='text-2xl'>{children}</h2>

    return (
        <div className='space-y-4 mb-12 h-fit'>
            <div className='flex justify-between items-center'>
                <h1 className='text-h1'>Edit Page</h1>
                {page?.id && (<>
                    <ButtonLink
                        size="md"
                        color="secondary"
                        to={`/stories/${page.storyId}/pages/${page.id}`}
                    >
                        Done
                    </ButtonLink>
                </>)}
            </div>
            <pageEditorFetcher.Form
                method="post"
                action="/resources/page-editor"
                autoComplete="off"
                {...form.props}
            >
                <input name="id" type="hidden" value={page?.id}/>
                <input name="parentChoiceId" type="hidden" value={page?.parentChoiceId}/>
                <input name="storyId" type="hidden" value={page.storyId}/>
                <div className='mb-2'><Subtitle>Page</Subtitle></div>
                <TextareaField
                    className="no-required-asterisk"
                    labelProps={{
                        htmlFor: fields.pageContent.id,
                        children: prompt,
                    }}
                    textareaProps={{
                        ...conform.textarea(fields.pageContent),
                    }}
                    errors={fields.pageContent.errors}
                />
                <ErrorList errors={form.errors} id={form.errorId}/>

                <div className='flex gap-4 items-center mb-6 pb-6 border-b border-night-400'>
                    <Subtitle>Choices</Subtitle>
                    {/* TODO manually re-creating the Flowbite button as a shitty workaround to make adding choices to this list work. Using the FlowbiteButton wrapper doesn't work */}
                    <button
                        className='group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none text-white border border-night-400 focus:ring-blue-300 dark:focus:ring-blue-800 hover:bg-accent-yellow hover:text-night-700 focus:bg-accent-yellow focus:text-night-700 active:bg-accent-yellow-muted rounded-lg focus:ring-2'
                        {...list['insert'](fields.choices.name, { defaultValue: 'Enter' })}
                    >
                        <span className="flex items-center transition-all duration-200 rounded-md text-sm px-3 py-1.5">Add Choice</span>
                    </button>
                </div>

                <ul>
                    {choices.map((choice, index) => (
                        <li key={choice.key} className='border-b border-night-400 pb-4 mb-6 space-y-4'>
                            <ChoiceFieldset config={choice} index={index} name={fields.choices.name}/>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-between gap-4">
                    <div className="flex gap-4">
                        <Button
                            size="sm"
                            color="primary"
                            status={
                                pageEditorFetcher.state === 'submitting'
                                    ? 'pending'
                                    : 'idle'
                            }
                            type="submit"
                            disabled={pageEditorFetcher.state !== 'idle'}
                        >
                            {page.id ? 'Save Changes' : 'Create Page'}
                        </Button>
                    </div>
                    {page?.id && canDeletePage && (
                        <div className="flex">
                            <ButtonLink
                                size="sm"
                                color="danger"
                                to={`/stories/${page.storyId}/pages/${page.id}/delete`}
                            >
                                Delete Page
                            </ButtonLink>
                        </div>
                    )}
                </div>
            </pageEditorFetcher.Form>
        </div>
    )
}

type ChoiceFieldsetProps = {
    config: FieldConfig<z.infer<typeof ChoiceSchema>>;
    index: number;
    name: string;
};

function ChoiceFieldset({ config, index, name }: ChoiceFieldsetProps) {
    const ref = useRef<HTMLFieldSetElement>(null);
    // Both useFieldset / useFieldList accept form or fieldset ref
    const { id, content, nextPageId } = useFieldset(ref, config);
    console.log(id.defaultValue, content.defaultValue, nextPageId.defaultValue)

    return (
        <fieldset ref={ref}>
            <input type='hidden' name={id.name} value={id.defaultValue}/>
            <div className='flex gap-2 items-center mb-4'>
                <SimpleField
                    className="no-required-asterisk w-full"
                    labelProps={{
                        htmlFor: content.id,
                        children: `Choice #${index + 1}...`,
                    }}
                    inputProps={{
                        ...conform.input(content),
                    }}
                />

                <button {...list.remove(name, { index })} disabled={!!nextPageId.defaultValue}
                        className='disabled:text-night-400'>
                    <FaMinusCircle aria-setsize={24} size={24}/>
                </button>
            </div>
            {/*{nextPageId.defaultValue ? (*/}
            <div className='flex gap-2 items-center'>
                <BsArrowReturnRight size={24}/>
                <SimpleField
                    className="no-required-asterisk w-full"
                    labelProps={{
                        htmlFor: nextPageId.id,
                        children: `Next Page Id...`,
                    }}
                    inputProps={{
                        ...conform.input(nextPageId),
                    }}
                />
                <FaMinusCircle aria-setsize={24} size={24}/>
            </div>
            {/*) : (*/}
            {/*    <div className='flex gap-2 items-center'>*/}
            {/*        <BsArrowReturnRight size={24}/>*/}
            {/*        <Button>*/}
            {/*            Add page*/}
            {/*        </Button>*/}
            {/*    </div>*/}
            {/*)}*/}
            <span>{content.error || nextPageId.error}</span>
        </fieldset>
    );
}