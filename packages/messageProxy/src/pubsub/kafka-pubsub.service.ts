import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { BroadcastMessage, OnPublishCallback, PubSub } from './types';
import { DocKey } from '../doc/types';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

export const TOPICS = {
    changes: config.kafka.changesTopic,
    service: config.kafka.serviceTopic,
};

type TopicKeys = keyof typeof TOPICS;

@Injectable()
export class KafkaPubsubService implements PubSub<TopicKeys> {
    private publisher: Producer;
    private subscriber: Consumer;
    private callbacks: Map<string, OnPublishCallback[]> = new Map();
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
    }

    publish(topic: TopicKeys, key: DocKey, message: BroadcastMessage): void {
        this.publisher
            .send({
                topic: topic,
                messages: [
                    {
                        key: key,
                        value: Buffer.from(JSON.stringify(message)),
                    },
                ],
            })
            .then(console.log)
            .catch(console.log);
    }

    addCallback(topic: TopicKeys, callback: OnPublishCallback) {
        let callbacksByTopic = this.callbacks.get(topic);

        if (callbacksByTopic) {
            callbacksByTopic.push(callback);
        } else {
            callbacksByTopic = [callback];
        }

        this.callbacks.set(topic, callbacksByTopic);
    }

    connect(): void {
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
                const callbacksByTopic = this.callbacks.get(topic);

                for (const i in callbacksByTopic) {
                    callbacksByTopic[i](key, message.value.toString());
                }
            },
        });
    }

    disconnect(): void {
        this.subscriber.disconnect();
        this.publisher.disconnect();
    }
}
