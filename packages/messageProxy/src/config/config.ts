export default () => ({
    kafka: {
        changesTopic: process.env.KAFKA_CHANGES_TOPIC || 'changes',
        host: process.env.KAFKA_HOST || 'localhost:9092',
    },
    dapr: {
        host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
        port: process.env.DAPR_SIDECAR_PORT || '3500',
    },
});
