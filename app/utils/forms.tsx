import * as Checkbox from '@radix-ui/react-checkbox'
import { Link } from '@remix-run/react'
import { clsx } from 'clsx'
import React, { type ElementType, useId } from 'react'
import styles from './forms.module.css'
import {
	Button as FlowbiteButton,
	type ButtonProps as FlowbiteButtonProps,
	Spinner,
} from 'flowbite-react'

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
	id,
	errors,
	extraListClassName,
}: {
	errors?: ListOfErrors
	id?: string
	extraListClassName?: string
}) {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null
	return (
		<ul id={id} className={clsx('space-y-1', extraListClassName)}>
			{errorsToRender.map(e => (
				<li key={e} className="text-[10px] text-accent-alert">
					{e}
				</li>
			))}
		</ul>
	)
}

export function Field({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: Omit<JSX.IntrinsicElements['label'], 'className'>
	inputProps: Omit<JSX.IntrinsicElements['input'], 'className'>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={clsx(styles.field, className)}>
			<input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				placeholder=" "
				{...inputProps}
				className="h-16 w-full rounded-lg border border-night-400 px-4 pt-4 text-body-xs outline-none focus:border-accent-primary disabled:bg-night-400 dark:bg-night-primary dark:caret-white"
			/>
			{/* the label comes after the input so we can use the sibling selector in the CSS to give us animated label control in CSS only */}
			<label htmlFor={id} {...labelProps} />
			{errors && (
				<div className="px-4 pt-1">
					{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
				</div>
			)}
		</div>
	)
}

export function SimpleField({
	labelProps,
	inputProps,
	className,
	errorId,
}: {
	labelProps: Omit<JSX.IntrinsicElements['label'], 'className'>
	inputProps: Omit<JSX.IntrinsicElements['input'], 'className'>
	className?: string
	errorId?: string
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	return (
		<div className={clsx(styles.field, className)} style={{ minHeight: 0 }}>
			<input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				placeholder=" "
				{...inputProps}
				className="h-16 w-full rounded-lg border border-night-400 px-4 pt-4 text-body-xs caret-white outline-none focus:border-accent-primary disabled:bg-night-400 dark:bg-night-primary"
			/>
			{/* the label comes after the input so we can use the sibling selector in the CSS to give us animated label control in CSS only */}
			<label htmlFor={id} {...labelProps} />
		</div>
	)
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: Omit<JSX.IntrinsicElements['label'], 'className'>
	textareaProps: Omit<JSX.IntrinsicElements['textarea'], 'className'>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={clsx(styles.textareaField, className)}>
			<textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				placeholder=" "
				{...textareaProps}
				className="h-48 w-full rounded-lg border border-night-400 px-4 pt-8 text-body-xs caret-white outline-none focus:border-accent-primary disabled:bg-night-400 dark:bg-night-primary"
			/>
			{/* the label comes after the input so we can use the sibling selector in the CSS to give us animated label control in CSS only */}
			<label htmlFor={id} {...labelProps} />
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function CheckboxField({
	labelProps,
	buttonProps,
	errors,
}: {
	labelProps: Omit<JSX.IntrinsicElements['label'], 'className'>
	buttonProps: Omit<
		React.ComponentPropsWithoutRef<typeof Checkbox.Root>,
		'type' | 'className'
	> & {
		type?: string
	}
	errors?: ListOfErrors
}) {
	const fallbackId = useId()
	const id = buttonProps.id ?? buttonProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={styles.checkboxField}>
			<div className="flex gap-2">
				<Checkbox.Root
					id={id}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					{...buttonProps}
					type="button"
				>
					<Checkbox.Indicator className="h-4 w-4">
						<svg viewBox="0 0 8 8">
							<path
								d="M1,4 L3,6 L7,2"
								stroke="black"
								strokeWidth="1"
								fill="none"
							/>
						</svg>
					</Checkbox.Indicator>
				</Checkbox.Root>
				<label
					htmlFor={id}
					{...labelProps}
					className="text-body-xs text-color-subtitle"
				/>
			</div>
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function getButtonClassName({
	size,
	variant,
}: {
	size: 'xs' | 'sm' | 'md' | 'md-wide' | 'pill'
	variant: 'primary' | 'secondary' | 'danger'
}) {
	const baseClassName =
		'flex whitespace-nowrap justify-center items-center rounded-full font-bold outline-none transition-[background-color,color] duration-200 disabled:bg-night-500 disabled: text-color-subtitle'
	const primaryClassName =
		'bg-accent-primary hover:bg-accent-secondary hover:text-color-primary-inverted focus:bg-accent-secondary focus:text-color-primary-inverted active:bg-accent-secondary-muted'
	const secondaryClassName =
		'border-[1.5px] border-night-400 bg-night-700 hover:border-accent-primary focus:border-accent-primary active:border-accent-primary-lighter'
	const dangerClassName =
		'bg-accent-alert hover:bg-accent-secondary hover:text-color-primary-inverted focus:bg-accent-secondary focus:text-color-primary-inverted active:bg-accent-secondary-muted'
	const extraSmallClassName = 'py-2 px-3 text-body-xs'
	const smallClassName = 'px-10 py-[14px] text-body-xs'
	const mediumClassName = 'px-14 py-5 text-lg'
	const mediumWideClassName = 'px-24 py-5 text-lg'
	const pillClassName = 'px-12 py-3 leading-3'
	const className = clsx(baseClassName, {
		[primaryClassName]: variant === 'primary',
		[secondaryClassName]: variant === 'secondary',
		[dangerClassName]: variant === 'danger',
		[extraSmallClassName]: size === 'xs',
		[smallClassName]: size === 'sm',
		[mediumClassName]: size === 'md',
		[mediumWideClassName]: size === 'md-wide',
		[pillClassName]: size === 'pill',
	})
	return className
}

export type ButtonStatus = 'pending' | 'success' | 'error' | 'idle'
type ButtonProps<T extends ElementType = 'button'> = FlowbiteButtonProps<T> & {
	status?: ButtonStatus
	disabled?: boolean
}

export function Button<T extends ElementType = 'button'>(
	props: ButtonProps<T>,
) {
	const companion = {
		pending: (
			<Spinner
				className="ml-4"
				aria-label="Submitting request to create account"
			/>
		),
		success: <span className="ml-4">✅</span>,
		error: <span className="ml-4">❌</span>,
		idle: null,
	}[props.status || 'idle']
	return (
		<FlowbiteButton color={props.color ?? 'default'} {...props}>
			{props.children}
			{companion}
		</FlowbiteButton>
	)
}

export function ButtonLink(props: ButtonProps<typeof Link>) {
	// eslint-disable-next-line jsx-a11y/anchor-has-content
	return <Button as={Link} {...props} />
}

export function LabelButton({
	size,
	variant,
	...props
}: Omit<React.ComponentPropsWithoutRef<'label'>, 'className'> &
	Parameters<typeof getButtonClassName>[0]) {
	return (
		<label
			{...props}
			className={clsx('cursor-pointer', getButtonClassName({ size, variant }))}
		/>
	)
}
