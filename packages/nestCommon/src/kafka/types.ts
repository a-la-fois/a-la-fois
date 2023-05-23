export type KafkaOptions = {
    clientId: string;
    topicsToSubscribe: string[];
    hosts: string[];
    caPath: string;
    username: string;
    password: string;
    saslMechanism: string;
};

export type CallbackType = (topic: string, message: string) => void;
