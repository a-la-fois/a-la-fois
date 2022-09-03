const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'messageProxy',
    brokers: ['localhost:9092'],
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
    },
});
