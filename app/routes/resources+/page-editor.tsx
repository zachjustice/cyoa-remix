import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ButtonLink, ErrorList, TextareaField } from '~/utils/forms.tsx'
import { requireStoryEditor } from '~/utils/permissions.server.ts'
import { BsArrowReturnRight } from "react-icons/bs/index.js";
import { FaMinusCircle } from "react-icons/fa/index.js";
import { useState } from "react";
import qs from 'qs'
import { logJSON } from "~/utils/logging.ts";

export const PageEditorSchema = z.object({
    id: z.string().optional(),
    pageContent: z.string().min(1),
    parentChoiceId: z.string().optional(),
    storyId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
    const text = await request.text()
	console.log(JSON.stringify(qs.parse(text)), null, 2)
    logJSON(qs.parse(text))
    const userId = await requireUserId(request)

    const formData = await request.formData()

    const submission = parse(formData, {
        schema: PageEditorSchema,
        acceptMultipleErrors: () => true,
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

    let page: {id: string}

    const { pageContent, id, parentChoiceId, storyId } = submission.value

    await requireStoryEditor(storyId, userId)

    if (id) {
        const existingPage = await prisma.page.findFirst({
            where: { id },
            select: { id: true },
        })

        if (!existingPage) {
            return json(
                {
                    status: 'error',
                    submission,
                } as const,
                { status: 404 },
            )
        }

        page = await prisma.page.update({
            where: { id },
            data: {
                content: pageContent,
            },
            select: {
                id: true,
            },
        })
    } else if (parentChoiceId) {
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
        page = { id: choice.nextPageId }
    } else {
        // first page in a story
        const existingStory = await prisma.story.findFirst({
            where: { id: storyId },
            select: { firstPageId: true },
        })

        if (existingStory?.firstPageId) {
            return json(
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
        page = { id: story.firstPageId }
    }

    return redirect(`/stories/${storyId}/pages/${page.id}/?editPage=true`)
}

type PageEditorProps = {
    page: {
        id?: string
        content?: string
        parentChoiceId?: string
        storyId?: string
        nextChoices?: any[] | null
    }
    canDeletePage: boolean
}

export function PageEditor(props: PageEditorProps) {
    const { page, canDeletePage } = props
    const pageEditorFetcher = useFetcher<typeof action>()
    const [ nextChoices, setNextChoices ] = useState(page?.nextChoices || [])

    const [ form, fields ] = useForm({
        id: 'page-editor',
        constraint: getFieldsetConstraint(PageEditorSchema),
        lastSubmission: pageEditorFetcher.data?.submission,
        onValidate({ formData }) {
            return parse(formData, { schema: PageEditorSchema })
        },
        defaultValue: {
            pageContent: page?.content,
        },
        shouldRevalidate: 'onBlur',
    })

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
            <h1 className='text-h1'>Edit Page</h1>
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
                    <Button color='primary'
                            size='sm'
                            onClick={() => setNextChoices([ ...nextChoices, {} ])}>
                        Add Choice
                    </Button>
                </div>
                {[].map((choice, index) => {
                    return (
                        <div key={choice.id} className='border-b border-night-400 pb-4 mb-6 space-y-4'>
                            <div className='flex gap-2 items-center'>
                                <SimpleField
                                    key={choice.id}
                                    className="no-required-asterisk w-full"
                                    labelProps={{
                                        htmlFor: fields.choiceContent.id,
                                        children: `Choice #${index + 1}...`,
                                    }}
                                    inputProps={{
                                        name: `choice[${index}][content]`,
                                        defaultValue: choice.content
                                    }}
                                    errors={fields.choiceContent.errors} />
                                <FaMinusCircle aria-setsize={24} size={24} />
                            </div>
                            {choice.nextPageId ? (
                                <div className='flex gap-2 items-center'>
                                    <BsArrowReturnRight size={24}/>
                                    <SimpleField
                                        key={choice.id}
                                        className="no-required-asterisk w-full"
                                        labelProps={{
                                            htmlFor: fields.choiceContent.id,
                                            children: `Next Page Id...`,
                                        }}
                                        inputProps={{
                                            name: `choice[${index}][nextPageId]`,
                                            defaultValue: choice.nextPageId
                                        }}
                                        errors={fields.choiceContent.errors}/>
                                    <FaMinusCircle aria-setsize={24} size={24}/>
                                </div>
                            ) : (
                                <div className='flex gap-2 items-center'>
                                    <BsArrowReturnRight size={24}/>
                                    <Button>
                                        Add page
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}

                <div className="flex justify-between gap-4">
                    <div className="flex gap-4">
                        <Button
                            size="sm"
                            color="primary"
                            status={
                                pageEditorFetcher.state === 'submitting'
                                    ? 'pending'
                                    : pageEditorFetcher.data?.status ?? 'idle'
                            }
                            type="submit"
                            disabled={pageEditorFetcher.state !== 'idle'}
                        >
                            Save Changes
                        </Button>
                        {page?.id && (
                            <ButtonLink
                                size="sm"
                                color="secondary"
                                type="reset"
                                to={`/stories/${page.storyId}/pages/${page.id}`}
                            >
                                Cancel
                            </ButtonLink>
                        )}
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
