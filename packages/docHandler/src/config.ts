const mongoUriDefault = 'mongodb://127.0.0.1:27017/a-la-fois';

const mongoSsl = process.env.MONGO_SSL ? process.env.MONGO_SSL == 'true' : false;

export const config = {
    mongo: {
        mongoUri: process.env.MONGO_URI || mongoUriDefault,
        ssl: mongoSsl,
        sslCA: process.env.MONGO_SSL_CA_PATH || '',
    },
    server: {
        host: process.env.SERVER_HOST || '127.0.0.1',
        port: process.env.SERVER_PORT || '3001',
    },
    dapr: {
        host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
        port: process.env.DAPR_HTTP_PORT || '3501',
        gport: process.env.DAPR_GRPC_PORT || '4501',
    },
};
