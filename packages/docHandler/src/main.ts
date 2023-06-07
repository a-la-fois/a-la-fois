import { DaprServer } from '@dapr/dapr';
import mongoose from 'mongoose';
import { DocHandler } from './actor';
import { config } from './config';

const mongoConnect = () => {
    const mongoConfig = config.mongo;
    const params: mongoose.ConnectOptions = { ssl: mongoConfig.ssl as boolean };

    if (mongoConfig.sslCA) {
        params['sslCA'] = mongoConfig.sslCA;
    }
    mongoose.connect(mongoConfig.mongoUri, params);
};

async function start() {
    mongoConnect();
    const server = new DaprServer({
        serverHost: config.server.host,
        serverPort: config.server.port,
        clientOptions: {
            daprHost: config.dapr.host,
            daprPort: config.dapr.port,
        },
    });

    await server.actor.init();
    await server.actor.registerActor(DocHandler);
    await server.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});
