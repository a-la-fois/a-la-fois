#!/usr/bin/env node
const got = require('got');
const fs = require('node:fs');
const path = require('node:path');

const run = async () => {
    const res = await got
        .post('http://localhost:3002/admin/devSetup', {
            headers: {
                Authorization: 'le_secret',
            },
        })
        .json();

    const keyFolderPath = path.resolve(__dirname, '../.dev');

    fs.mkdirSync(keyFolderPath, { recursive: true });
    const keyPath = path.resolve(__dirname, keyFolderPath, 'private_key');
    fs.writeFileSync(keyPath, res.consumer.privateKey);

    console.log('Test consumer private key is saved: ', keyPath);
};

run();
