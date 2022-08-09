import { DaprServer } from '@dapr/dapr';
import { DocHandler } from './docHandler';

const daprHost = "127.0.0.1";
const daprPort = "50000"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50001"; // App Port of this Example Server

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