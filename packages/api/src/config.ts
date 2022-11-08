const mongoUriDefault = 'mongodb://127.0.0.1:27017/a-la-fois';

export default () => ({
    mongo: {
        uri: process.env.MONGO_URI || mongoUriDefault,
    },
    server: {
        port: process.env.SERVER_PORT || '8000',
    },
});
