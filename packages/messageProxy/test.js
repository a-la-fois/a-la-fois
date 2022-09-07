const { Kafka } = require('kafkajs');
const fs = require('fs')

const kafka = new Kafka({
  clientId: 'messageProxy',
  brokers: ['rc1a-90u0593i7valqh5d.mdb.yandexcloud.net:9091'],
  ssl: {
    ca: [fs.readFileSync('./CA.pem')],
  },
  sasl: {
    mechanism: 'SCRAM-SHA-512',
    username: 'fois-user',
    password: 'nnEivGtikFLIVgcCtKBgnccvnCBcLUKdihhjHf',
  }
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
