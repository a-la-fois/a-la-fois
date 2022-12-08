const mongoUriDefault = 'mongodb://127.0.0.1:27017/a-la-fois';

const mongoSsl = process.env.MONGO_SSL ? process.env.MONGO_SSL == 'true' : false;

export default {
    daprHost: process.env.DAPR_HOST || '127.0.0.1',
    daprPort: process.env.DAPR_PORT || '3501',
    serverHost: process.env.SERVER_HOST || '127.0.0.1',
    serverPort: process.env.SERVER_PORT || '3001',
    mongo: {
        mongoUri: process.env.MONGO_URI || mongoUriDefault,
        ssl: mongoSsl,
        sslCA: process.env.MONGO_SSL_CA_PATH || '',
    },
};
