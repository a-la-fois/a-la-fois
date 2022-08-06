const path = require('path');

module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: path.resolve(__dirname, 'src'),
    testRegex: '.test.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
};
