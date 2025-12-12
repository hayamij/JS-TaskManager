module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'domain/**/*.js',
        'business/**/*.js',
        'adapters/**/*.js',
        'infrastructure/**/*.js',
        '!**/*.test.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
