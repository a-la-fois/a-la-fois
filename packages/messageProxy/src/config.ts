export const config = {
    kafka: {
        changesTopic: process.env.KAFKA_CHANGES_TOPIC || 'changes',
        hosts: process.env.KAFKA_HOSTS || '127.0.0.1:9092',
        caPath: process.env.KAFKA_CA_PATH || '',
        username: process.env.KAFKA_USERNAME || '',
        password: process.env.KAFKA_PASSWORD || '',
        mechanism: process.env.KAFKA_SASL_MECHANISM || '',
    },
    dapr: {
        host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
        port: process.env.DAPR_HTTP_PORT || '3500',
        gport: process.env.DAPR_GRPC_PORT || '4500',
    },
} as const;
