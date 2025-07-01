const stylelintConfig = {
    extends: ['stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-scss'],

    rules: {
        'at-rule-empty-line-before': null,
        'scss/comment-no-empty': null,
        'scss/double-slash-comment-whitespace-inside': null,
        'scss/dollar-variable-colon-space-after': null,
        'scss/dollar-variable-empty-line-before': null,
        'scss/dollar-variable-pattern': null,
        'scss/double-slash-comment-empty-line-before': null,
        'scss/at-mixin-pattern': null,
        'scss/at-function-pattern': null,
        'scss/at-if-closing-brace-newline-after': null,
        'scss/at-else-closing-brace-newline-after': null,
        'scss/at-else-closing-brace-space-after': null,
        'scss/at-if-closing-brace-space-after': null,
        'scss/operator-no-unspaced': null,
        'color-hex-length': null,
        'value-keyword-case': null,
        'no-descending-specificity': null,
        'selector-class-pattern': null,
    },
}

export default stylelintConfig
