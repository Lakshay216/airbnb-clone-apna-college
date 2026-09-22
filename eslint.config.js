const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^next$' }],
        },
    },
    {
        files: ['public/js/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                mapboxgl: 'readonly',
                mapToken: 'readonly',
                listing: 'readonly',
            },
        },
    },
];
