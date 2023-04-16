const mongoUriDefault = 'mongodb://127.0.0.1:27017/a-la-fois';

const mongoSsl = process.env.MONGO_SSL ? process.env.MONGO_SSL == 'true' : false;

export const config = {
    mongo: {
        uri: process.env.MONGO_URI || mongoUriDefault,
        ssl: mongoSsl,
        sslCA: process.env.MONGO_SSL_CA_PATH || '',
    },
    server: {
        port: process.env.SERVER_PORT || '3002',
    },
    dapr: {
        serverHost: process.env.DAPR_SERVER_HOST || '127.0.0.1',
        serverPort: process.env.DAPR_SERVER_PORT || '3003',
        host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
        port: process.env.DAPR_SIDECAR_PORT || '3503',
    },
    admin: {
        secret: process.env.ADMIN_SECRET ?? null,
    },
} as const;
