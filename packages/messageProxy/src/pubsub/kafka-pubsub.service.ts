import { readFileSync } from 'fs';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

const TOPICS = {
    changes: config.kafka.changesTopic,
    service: config.kafka.serviceTopic,
};

export type TopicKeys = keyof typeof TOPICS;

export type CallbackType = (message: string) => void;

@Injectable()
export class KafkaPubsubService implements OnModuleDestroy {
    private publisher: Producer;
    private subscriber: Consumer;
    private callbacks: CallbackType[] = [];
    private changesTopic: string;
    private serviceTopic: string;
    private kafka: Kafka;

    constructor() {
        const { caPath, username, password, mechanism, hosts } = config.kafka;
        this.changesTopic = TOPICS.changes;
        this.serviceTopic = TOPICS.service;

        // TODO: kafka config constructor
        const params = {};

        if (caPath) {
            params['ssl'] = {
                ca: [readFileSync(caPath)],
            };
        }

        if (username && password) {
            params['sasl'] = {
                mechanism,
                username,
                password,
            };
        }

        this.kafka = new Kafka({
            clientId: 'messageProxy',
            brokers: hosts.split(','),
            ...params,
        });

        this.connect();
    }
    onModuleDestroy() {
        this.subscriber.disconnect();
        this.publisher.disconnect();
    }

    publish(topic: TopicKeys, message: string): void {
        this.publisher
            .send({
                topic: TOPICS[topic],
                messages: [
                    {
                        value: Buffer.from(message),
                    },
                ],
            })
            .then(console.log)
            .catch(console.log);
    }

    addCallback(callback: CallbackType) {
        this.callbacks.push(callback);
    }

    private connect(): void {
        this.publisher = this.kafka.producer();
        this.publisher.connect().then(() => console.log('Publisher connected to a kafka broker'));

        this.subscriber = this.kafka.consumer({
            groupId: uuidv4(),
        });
        this.subscriber.connect().then(() => console.log('Subscriber connected to a kafka broker'));

        this.subscriber.subscribe({
            topics: [this.changesTopic, this.serviceTopic],
            fromBeginning: false,
        });

        this.subscriber.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                const key = message.key.toString();

                for (const callback of this.callbacks) {
                    callback(message.value.toString());
                }
            },
        });
    }
}
