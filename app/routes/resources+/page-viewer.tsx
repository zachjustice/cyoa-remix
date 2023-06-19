import { clsx } from 'clsx'
import React from 'react'
import Choice from '~/components/Choice.tsx'
import { EditIconLink } from '~/components/EditIcon.tsx'
import { ChoiceEditor } from '~/routes/resources+/choice-editor.tsx'
import { type ViewedPage } from '~/routes/stories+/$storyId+/pages+/$pageId+/_index.tsx'

type PageProps = {
	page: ViewedPage //{nextChoices: Choice[]} extends Page,
	storyId: string
	editable: boolean
	editChoiceId?: string
}

export function PageViewer({
	page,
	storyId,
	editable = false,
	editChoiceId,
}: PageProps) {
	return (
		<div className="flex flex-col">
			<div className="flex-grow">
				<div
					className={clsx(' flex gap-2', {
						'mb-6': editable,
						'mb-2': !editable,
					})}
				>
					{editable && <EditIconLink to="edit" variant="outline" />}
					<p>{page.content}</p>
				</div>

				<ul className="ml-12" key={page.id}>
					{page.nextChoices.map(choice => {
						return (
							<Choice
								key={choice.id}
								editable={editable}
								editChoiceId={editChoiceId}
								storyId={storyId}
								page={page}
								choice={choice}
							/>
						)
					})}
				</ul>

				{editable && page.nextChoices.length < 4 && (
					<div className="mt-6">
						<ChoiceEditor
							choice={{
								parentPageId: page.id,
								storyId: storyId,
							}}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
