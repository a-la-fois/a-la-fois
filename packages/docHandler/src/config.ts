export default {
    daprHost: process.env.DAPR_HOST || '127.0.0.1',
    daprPort: process.env.DAPR_PORT || '3501',
    serverHost: process.env.SERVER_HOST || '127.0.0.1',
    serverPort: process.env.SERVER_PORT || '3001',
};
