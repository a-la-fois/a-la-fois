#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const run = async () => {
    const keyPath = path.resolve(__dirname, '../.dev/private_key_new');

    if (!fs.existsSync(keyPath)) {
        console.error(`No private key in: ${keyPath}\nRun "yarn setup:dev"`);
        return;
    }

    const privateKey = fs.readFileSync(keyPath);

    const token = jwt.sign({ consumerId: '6490d4dd10c307c2661f3efd' }, privateKey, {
        algorithm: 'RS256',
    });

    console.log(token);
};

run();
