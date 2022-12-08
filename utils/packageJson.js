const { resolve } = require('node:path');

module.exports.getPackageJsonPath = () => {
    return resolve(__dirname, '../package.json');
};
