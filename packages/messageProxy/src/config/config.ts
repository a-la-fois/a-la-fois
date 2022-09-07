export default () => ({
    kafka: {
        changesTopic: process.env.KAFKA_CHANGES_TOPIC || 'changes',
        host: process.env.KAFKA_HOSTS || '127.0.0.1:9092',
        caPath: process.env.KAFKA_CA_PATH || '',
    },
    dapr: {
        host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
        port: process.env.DAPR_SIDECAR_PORT || '3500',
    },
});
