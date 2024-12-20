import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme.js'
import tailwindcssRadix from 'tailwindcss-radix'

export default {
	content: [
		'./app/**/*.{ts,tsx,jsx,js}',
		'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			screens: {
				xs: '375px',
			},
			colors: {
				// for text color i.e. `text-color-primary`
				color: {
					primary: '#FFFFFF',
					subtitle: '#AAAAAA',
					'primary-inverted': '#090909',
				},
				night: {
					100: '#DADADA',
					200: '#AAAAAA',
					300: '#717171',
					400: '#494949',
					500: '#1E1E20',
					600: '#141414',
					700: '#090909',
					// use bg-night-primary instead of bg-gray-950
					primary: '#030712', // gray-950
					'primary-highlight': '#111827', // gray-900
					subtitle: '#9198A1',
					border: '#1f2937', // gray-800
				},
				day: {
					100: '#F7F5FF',
					200: '#E4E4FB',
					300: '#DDDDF4',
					400: '#D0D0E8',
					500: '#9696E0',
					600: '#9999CC',
					700: '#6A44FF',
					primary: '#FFFFFF',
					'primary-highlight': '#f1f5f9',
					subtitle: '#59636E',
				},
				accent: {
					red: '#EF5A5A',
					blue: '#429AFF',

					primary: '#6A44FF',
					'primary-muted': '#9696E0',
					secondary: '#FFBE3F',
					'secondary-muted': '#FFD262',
					highlight: '#F183FF',
					alert: '#EF5A5A',
				},
			},
			fontFamily: {
				sans: ['Nunito Sans', ...defaultTheme.fontFamily.sans],
			},
			fontSize: {
				// 1rem = 16px
				/** 80px size / 84px high / bold */
				mega: ['5rem', { lineHeight: '5.25rem', fontWeight: '700' }],
				/** 56px size / 62px high / bold */
				h1: ['3.5rem', { lineHeight: '3.875rem', fontWeight: '700' }],
				/** 40px size / 48px high / bold */
				h2: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
				/** 32px size / 36px high / bold */
				h3: ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
				/** 28px size / 36px high / bold */
				h4: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
				/** 24px size / 32px high / bold */
				h5: ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
				/** 16px size / 20px high / bold */
				h6: ['1rem', { lineHeight: '1.25rem', fontWeight: '700' }],

				/** 32px size / 36px high / normal */
				'body-2xl': ['2rem', { lineHeight: '2.25rem' }],
				/** 28px size / 36px high / normal */
				'body-xl': ['1.75rem', { lineHeight: '2.25rem' }],
				/** 24px size / 32px high / normal */
				'body-lg': ['1.5rem', { lineHeight: '2rem' }],
				/** 20px size / 28px high / normal */
				'body-md': ['1.25rem', { lineHeight: '1.75rem' }],
				/** 16px size / 20px high / normal */
				'body-sm': ['1rem', { lineHeight: '1.25rem' }],
				/** 14px size / 18px high / normal */
				'body-xs': ['0.875rem', { lineHeight: '1.125rem' }],
				/** 12px size / 16px high / normal */
				'body-2xs': ['0.75rem', { lineHeight: '1rem' }],

				/** 18px size / 24px high / semibold */
				caption: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
				/** 12px size / 16px high / bold */
				button: ['0.875rem', { lineHeight: '0.5rem', fontWeight: '700' }],
			},
		},
	},
	plugins: [tailwindcssRadix, require('flowbite/plugin')],
} satisfies Config
