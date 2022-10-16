const { Kafka } = require('kafkajs');
const fs = require('fs');

const kafka = new Kafka({
    clientId: 'messageProxy',
    brokers: ['127.0.0.1:9092'],
});

const publisher = kafka.producer();
const subscriber = kafka.consumer({
    groupId: 'changes',
});

subscriber.connect().then(() => console.log('Consumer connected to a kafka broker.'));
publisher.connect().then(() => console.log('Provider connected to a kafka broker.'));

subscriber.subscribe({
    topic: 'changes',
    fromBeginning: false,
});

subscriber.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const key = message.key.toString();
        console.log(message.value.toString());
    },
});
