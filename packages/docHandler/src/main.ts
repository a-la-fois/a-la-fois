import { DaprServer } from '@dapr/dapr';
import { DocHandler } from './actor';
import Config from './config';

async function start() {
    const server = new DaprServer(Config.serverHost, Config.serverPort, Config.daprHost, Config.daprPort);

    await server.actor.init();
    await server.actor.registerActor(DocHandler);
    await server.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
