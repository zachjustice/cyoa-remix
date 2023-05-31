import {conform, useForm} from '@conform-to/react'
import {getFieldsetConstraint, parse} from '@conform-to/zod'
import {json, redirect, type DataFunctionArgs} from '@remix-run/node'
import {useFetcher} from '@remix-run/react'
import {z} from 'zod'
import {requireUserId} from '~/utils/auth.server.ts'
import {prisma} from '~/utils/db.server.ts'
import {Button, ErrorList, Field, TextareaField} from '~/utils/forms.tsx'
import invariant from "tiny-invariant";

export const PageEditorSchema = z.object({
    id: z.string().optional(),
    content: z.string().min(1),
    parentChoiceId: z.string().optional(),
    storyId: z.string().optional(),
})

export async function action({request}: DataFunctionArgs) {
    const userId = await requireUserId(request)

    const formData = await request.formData()

    const submission = parse(formData, {
        schema: PageEditorSchema,
        acceptMultipleErrors: () => true,
    })

    if (submission.intent !== 'submit') {
        return json({status: 'idle', submission} as const)
    }

    if (!submission.value) {
        return json(
            {
                status: 'error',
                submission,
            } as const,
            {status: 400},
        )
    }

    let page: { id: string; }

    const {content, id, parentChoiceId, storyId} = submission.value
    console.log(`## submission.value ${submission.value}`)

    const data = {
        ownerId: userId,
        content: content,
    }

    const select = {
        id: true,
    }

    if (id) {
        const existingPage = await prisma.page.findFirst({
            where: {id, ownerId: userId},
            select: {id: true},
        })

        if (!existingPage) {
            return json(
                {
                    status: 'error',
                    submission,
                } as const,
                {status: 404},
            )
        }

        page = await prisma.page.update({
            where: {id},
            data,
            select,
        })
    } else if (parentChoiceId) {
        // not the first page in a story
        const choice = await prisma.choice.update({
            where: {id: parentChoiceId},
            select: {
                nextPageId: true,
            },
            data: {
                nextPage: {
                    create: {
                        owner: {connect: {id: data.ownerId}},
                        content: data.content
                    }
                }
            }
        })

        invariant(choice?.nextPageId, `Failed to update choice ${parentChoiceId}`)
        page = {id: choice.nextPageId}
    } else {
        // first page in a story
        const existingStory = await prisma.story.findFirst({
            where: {id: storyId},
            select: {firstPageId: true}
        });

        if (existingStory?.firstPageId) {
            return json(
                {
                    status: 'error',
                    submission,
                } as const,
                {status: 400})
        }

        const story = await prisma.story.update({
            where: {id: storyId},
            select: {
                firstPageId: true,
            },
            data: {
                firstPage: {
                    create: {
                        owner: {connect: {id: data.ownerId}},
                        content: data.content
                    }
                }
            }
        })
        console.log(`## story: ${JSON.stringify(story)}`)

        invariant(story.firstPageId, `Failed to update first page on story ${storyId}`)
        page = {id: story.firstPageId}
    }

    return redirect(`/stories/${storyId}/pages/${page.id}/`)
}

type PageEditorProps = {
    page?: {
        id?: string;
        content?: string;
        parentChoiceId?: string;
        storyId?: string;
    }
};

export function PageEditor(props: PageEditorProps) {
    const {page} = props;
    const pageEditorFetcher = useFetcher<typeof action>()

    const [form, fields] = useForm({
        id: 'page-editor',
        constraint: getFieldsetConstraint(PageEditorSchema),
        lastSubmission: pageEditorFetcher.data?.submission,
        onValidate({formData}) {
            return parse(formData, {schema: PageEditorSchema})
        },
        defaultValue: {
            content: page?.content,
        },
        shouldRevalidate: 'onBlur',
    })

    return (
        <pageEditorFetcher.Form
            method="post"
            action="/resources/page-editor"
            {...form.props}
        >
            <input name="id" type="hidden" value={page?.id}/>
            <input name="parentChoiceId" type="hidden" value={page?.parentChoiceId}/>
            <input name="storyId" type="hidden" value={page?.storyId}/>
            <TextareaField
                className="no-required-asterisk"
                labelProps={{htmlFor: fields.content.id, children: "This page is blank..."}}
                textareaProps={{
                    ...conform.textarea(fields.content),
                    autoComplete: 'content',
                }}
                errors={fields.content.errors}
            />
            <ErrorList errors={form.errors} id={form.errorId}/>
            <div className="flex justify-end gap-4">
                <Button size="md" variant="secondary" type="reset">
                    Reset
                </Button>
                <Button
                    size="md"
                    variant="primary"
                    status={
                        pageEditorFetcher.state === 'submitting'
                            ? 'pending'
                            : pageEditorFetcher.data?.status ?? 'idle'
                    }
                    type="submit"
                    disabled={pageEditorFetcher.state !== 'idle'}
                >
                    Submit
                </Button>
            </div>
        </pageEditorFetcher.Form>
    )
}
