import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        files: [ 'src/**/*.js', 'src/**/*.ts', 'eslint.config.js' ],
        ignores: [ 'src/js/lib/**/*.js' ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { modules: true },
                ecmaVersion: 'latest',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': ts,
        },
        rules: {
            ...ts.configs['eslint-recommended'].rules,
            ...ts.configs['recommended'].rules,
            '@typescript-eslint/return-await': 2,
            'array-bracket-spacing': [
                'error',
                'always',
                { arraysInArrays: false },
            ],
            'capitalized-comments': 'error',
            'comma-dangle': [
                'error',
                'always-multiline',
            ],
            'comma-spacing': [
                'error',
                { before: false, after: true },
            ],
            'curly': 'error',
            'eol-last': 'error',
            'indent': [
                'error',
                4,
            ],
            'jsdoc/require-param-description': 0,
            'jsdoc/require-returns-description': 0,
            'key-spacing': 'error',
            'keyword-spacing': 'error',
            'linebreak-style': [
                'error',
                'unix',
            ],
            'lines-between-class-members': [
                'error',
                'always',
                { exceptAfterSingleLine: true },
            ],
            'no-duplicate-imports': 'error',
            'no-trailing-spaces': 'error',
            'object-curly-spacing': [ 'error', 'always' ],
            'quotes': [
                'error',
                'single',
                { avoidEscape: true },
            ],
            'semi': [
                'error',
                'always',
            ],
            'space-before-blocks': 'error',
            'space-before-function-paren': [
                'error',
                'never',
            ],
        },
    },
];
