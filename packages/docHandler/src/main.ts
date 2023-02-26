import { DaprServer } from '@dapr/dapr';
import mongoose from 'mongoose';
import { DocHandler } from './actor';
import CONFIG from './config';

const mongoConnect = () => {
    const mongoConfig = CONFIG.mongo;
    const params: mongoose.ConnectOptions = { ssl: mongoConfig.ssl as boolean };

    if (mongoConfig.sslCA) {
        params['sslCA'] = mongoConfig.sslCA;
    }
    mongoose.connect(mongoConfig.mongoUri, params);
};

async function start() {
    mongoConnect();
    console.log(CONFIG.serverHost, CONFIG.serverPort, CONFIG.daprHost, CONFIG.daprPort);
    const server = new DaprServer(CONFIG.serverHost, CONFIG.serverPort, CONFIG.daprHost, CONFIG.daprPort);

    await server.actor.init();
    await server.actor.registerActor(DocHandler);
    await server.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
