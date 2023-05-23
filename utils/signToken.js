#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const run = async () => {
    const keyPath = path.resolve(__dirname, '../.dev/private_key');

    if (!fs.existsSync(keyPath)) {
        console.error(`No private key in: ${keyPath}\nRun "yarn setup:dev"`);
        return;
    }

    const docId = process.argv[2];
    const consumerId = process.argv[3];
    const privateKey = fs.readFileSync(keyPath);

    const token = jwt.sign(
        {
            tokenId: '20',
            oldTokenId: '19',
            consumerId,
            userId: 'someUser1',
            docs: [{ id: docId, rights: [] }],
        },
        privateKey,
        {
            algorithm: 'RS256',
        }
    );

    console.log(token);
};

run();
