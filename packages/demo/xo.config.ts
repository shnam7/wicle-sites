import {type FlatXoConfig} from 'xo'
import astroPlugin from 'eslint-plugin-astro'

const xoConfig: FlatXoConfig = [
    ...astroPlugin.configs.recommended,
    {
        prettier: true,
        semicolon: false,
        space: 4,
        rules: {
            'capitalized-comments': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'function-paren-newline': 'off',
            'implicit-arrow-linebreak': 'off',
            'arrow-body-style': ['error', 'as-needed'],
            '@typescript-eslint/no-empty-function': 'off',

            // '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
]

export default xoConfig
