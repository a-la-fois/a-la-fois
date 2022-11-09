import { resolve } from 'node:path';
import { existsSync, copyFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';

export type Config = {
    keepDependencies: string[];
};

const defaultConfig: Config = {
    keepDependencies: [],
};

const fieldsWhitelist = [
    'name',
    'versions',
    'description',
    'license',
    'author',
    'files',
    'bin',
    'main',
    'module',
    'types',
    'exports',
];

const backupSuffix = '__backup';
const configFileName = 'cleanPackage.config.js';

export const cleanPackage = (config: Config) => {
    // find package.json
    const rootPath = findRootPath();
    const packageJsonPath = resolve(rootPath, 'package.json');
    const backupPath = `${packageJsonPath}${backupSuffix}`;
    // make copy
    copyFileSync(packageJsonPath, backupPath);
    // require package.json
    const packageJson = require(packageJsonPath);
    // omit fields
    const cleanedPackageJson = fieldsWhitelist.reduce((acc, field) => {
        acc[field] = packageJson[field];

        return acc;
    }, {} as any);
    cleanedPackageJson.dependencies = {};

    config.keepDependencies.forEach((dependency) => {
        if (packageJson.dependencies && packageJson.dependencies[dependency]) {
            cleanedPackageJson.dependencies[dependency] = packageJson.dependencies[dependency];
        }
    });

    const json = JSON.stringify(cleanedPackageJson, null, 2);

    // save
    writeFileSync(packageJsonPath, json);

    console.log('rootPath', rootPath);
};

export const restorePackage = () => {
    const rootPath = findRootPath();
    const packageJsonPath = resolve(rootPath, 'package.json');
    const backupPath = `${packageJsonPath}${backupSuffix}`;

    if (!existsSync(backupPath)) {
        throw new Error(`No backup file ${backupPath}`);
    }

    if (existsSync(packageJsonPath)) {
        unlinkSync(packageJsonPath);
    }

    renameSync(backupPath, packageJsonPath);
};

export const getConfig = (path?: string): Config => {
    const configPath = path ?? resolve(findRootPath(), configFileName);
    console.log('configPath', configPath);
    let config: Partial<Config> = {};

    if (existsSync(configPath)) {
        config = require(configPath).default;
    }

    console.log('config', config);
    console.log('final', {
        ...defaultConfig,
        ...config,
    });

    return {
        ...defaultConfig,
        ...config,
    };
};

const findRootPath = () => {
    return resolve('./');
};
