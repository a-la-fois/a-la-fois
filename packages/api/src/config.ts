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
        port: process.env.DAPR_HTTP_PORT || '3503',
        gport: process.env.DAPR_GRPC_PORT || '4503',
    },
    admin: {
        secret: process.env.ADMIN_SECRET ?? null,
        maxTokenTtl: process.env.MAX_TOKEN_TTL || '8', // hours
    },
    cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false,
    },
    kafka: {
        serviceTopic: process.env.KAFKA_SERVICE_TOPIC || 'service',
        hosts: process.env.KAFKA_HOSTS || '127.0.0.1:9092',
        caPath: process.env.KAFKA_CA_PATH || '',
        username: process.env.KAFKA_USERNAME || '',
        password: process.env.KAFKA_PASSWORD || '',
        mechanism: process.env.KAFKA_SASL_MECHANISM || '',
    },
} as const;
