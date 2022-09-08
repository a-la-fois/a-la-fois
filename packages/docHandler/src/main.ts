import { DaprServer } from '@dapr/dapr';
import { DocHandler } from './actor';

const daprHost = process.env.DAPR_HOST || '127.0.0.1';
const daprPort = process.env.DAPR_PORT || '3501';
const serverHost = process.env.SERVER_HOST || '127.0.0.1';
const serverPort = process.env.SERVER_PORT || '3001';

async function start() {
    const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);

    await server.actor.init();
    await server.actor.registerActor(DocHandler);
    await server.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
