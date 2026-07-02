import {type FlatXoConfig} from 'xo'

const xoConfig: FlatXoConfig = [
    {
        prettier: true,
        space: 4,
        semicolon: false,
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        rules: {
            'prettier/prettier': ['error', {}, {usePrettierrc: true}],
            'capitalized-comments': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'function-paren-newline': 'off',
            'implicit-arrow-linebreak': 'off',
            'arrow-body-style': ['error', 'as-needed'],
            '@typescript-eslint/no-empty-function': 'off',

            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/strict-void-return': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            curly: 'off',
            '@stylistic/no-mixed-operators': 'off',
            'jsdoc/require-asterisk-prefix': ['error', 'always'],
            'jsdoc/check-tag-names': ['error', {definedTags: ['note']}],
        },
    },
]

export default xoConfig
