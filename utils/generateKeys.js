#!/usr/bin/env node
const crypto = require('node:crypto');

/**
 * Example of keys generation for javascript
 * Use this parameters for generation your keys and pass public key to A la fois
 */
const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            'rsa',
            {
                modulusLength: 4096,
                publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
            },
            (err, publicKey, privateKey) => {
                if (err) {
                    reject(err);
                }

                resolve({ publicKey, privateKey });
            },
        );
    });
};

generateKeyPair().then(JSON.stringify).then(console.log);
