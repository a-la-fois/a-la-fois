#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const lernaPath = path.resolve(__dirname, '../lerna.json');

const file = fs.readFileSync(lernaPath, 'utf8');
const lernaConfig = JSON.parse(file);
const currentVersion = lernaConfig.version;

const [major, minor, patch] = currentVersion.split('.');
const nextVersion = `${major}.${minor}.${Number(patch) + 1}`;

console.log(nextVersion);
