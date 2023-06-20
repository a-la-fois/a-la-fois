#!/usr/bin/env node
const kill = require('kill-port');

const apiPorts = [3003, 3002, 3503];
const docHandlerPorts = [3001, 3501];
const messageProxyPorts = [3000, 3500];

const ports = [...apiPorts, ...docHandlerPorts, ...messageProxyPorts];

const run = async () => {
    return Promise.all(ports.map((port) => kill(port).catch((err) => console.log(`port ${port}:`, err.message))));
};

run();
