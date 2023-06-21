#!/usr/bin/env node
const path = require('node:path');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const run = async () => {
    const keyPath = path.resolve(__dirname, '../.dev/private_key');

    if (!fs.existsSync(keyPath)) {
        console.error(`No private key in: ${keyPath}\nRun "yarn setup:dev"`);
        return;
    }

    const privateKey = fs.readFileSync(keyPath);

    const token = jwt.sign({ consumerId: '6433ed6c687b8fdaf97c4382' }, privateKey, {
        algorithm: 'RS256',
    });

    console.log(token);
};

run();
