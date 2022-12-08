const mongoUriDefault = 'mongodb://127.0.0.1:27017/a-la-fois';

const mongoSsl = process.env.MONGO_SSL ? process.env.MONGO_SSL == 'true' : false;

export default () => ({
    mongo: {
        uri: process.env.MONGO_URI || mongoUriDefault,
        ssl: mongoSsl,
        sslCA: process.env.MONGO_SSL_CA_PATH || '',
    },
    server: {
        port: process.env.SERVER_PORT || '8000',
    },
});
