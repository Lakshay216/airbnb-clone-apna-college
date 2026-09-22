module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setup-env.js'],
    collectCoverageFrom: [
        'app.js',
        'middleware.js',
        'schema.js',
        'controller/**/*.js',
        '!server.js',
    ],
    coverageDirectory: 'coverage',
};
