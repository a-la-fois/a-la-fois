import { DaprServer } from '@dapr/dapr';
import { DocHandler } from './docHandler';

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "3000";

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