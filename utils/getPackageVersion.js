#!/usr/bin/env node
const fs = require('node:fs');

const path = process.argv[2];

const file = fs.readFileSync(path, 'utf8');

const packageJson = JSON.parse(file);

console.log(packageJson.version);
