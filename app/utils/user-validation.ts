import { z } from 'zod'

export const usernameSchema = z
	.string({
		required_error: 'Username is required',
		invalid_type_error: 'Username must be a string',
	})
	.min(3, { message: 'Username is too short' })
	.max(20, { message: 'Username is too long' })
export const passwordSchema = z
	.string({
		required_error: 'Password is required',
		invalid_type_error: 'Password must be a string',
	})
	.min(6, { message: 'Password is too short' })
	.max(100, { message: 'Password is too long' })
export const nameSchema = z
	.string({
		required_error: 'Name is required',
		invalid_type_error: 'Name must be a string',
	})
	.min(3, { message: 'Name is too short' })
	.max(40, { message: 'Name is too long' })
export const emailSchema = z
	.string({
		required_error: 'Email is required',
		invalid_type_error: 'Email must be a string',
	})
	.email({ message: 'Email is invalid' })
	.min(3, { message: 'Email is too short' })
	.max(100, { message: 'Email is too long' })
