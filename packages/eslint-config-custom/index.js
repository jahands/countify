module.exports = {
	extends: ['next', 'turbo', 'prettier', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		// disable the rule for all files
		'@typescript-eslint/explicit-function-return-type': 'off',
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	overrides: [
		{
			// enable the rule specifically for TypeScript files
			files: ['*.ts', '*.mts', '*.cts',],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'error',
			},
		},
		{
			files: ['*.tsx'],
			rules: {
				// Not using next/image
				'@next/next/no-img-element': 'off',
			}
		}
	],
	parserOptions: {},
}
