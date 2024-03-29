const path = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: path.resolve(__dirname, 'src'),
    testRegex: '.test.ts$',
};
