import { Tooltip as FlowbitTooltip } from 'flowbite-react'
import { type ComponentProps, type FC } from 'react'

type TooltipProps = {
	content: string
	icon: FC<ComponentProps<'svg'>>
}

export function Tooltip(props: TooltipProps) {
	return (
		<FlowbitTooltip content={props.content}>
			<props.icon className="hover: text-[1.25rem] text-color-subtitle" />
		</FlowbitTooltip>
	)
}
