import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { BroadcastMessage, onPublishCallback, PubSub } from './types';
import { DocKey } from '../doc/types';
import { Changes } from '../messages';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

@Injectable()
export class KafkaPubsubService implements PubSub<DocKey> {
    private publisher: Producer;
    private subscriber: Consumer;
    protected callbacks: onPublishCallback[] = [];
    private subscribedKeys: Set<DocKey> = new Set<DocKey>();
    private changesTopic: string;
    private kafka: Kafka;

    constructor() {
        const { caPath, username, password, mechanism, hosts, changesTopic } = config.kafka;
        this.changesTopic = changesTopic;

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

    publish(key: DocKey, message: BroadcastMessage): void {
        this.publisher
            .send({
                topic: this.changesTopic,
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

    subscribe(key: DocKey): void {
        this.subscribedKeys.add(key);
    }

    unsubscribe(key: DocKey): void {
        this.subscribedKeys.delete(key);
    }

    addCallback(callback: onPublishCallback) {
        this.callbacks.push(callback);
    }

    connect(): void {
        this.publisher = this.kafka.producer();
        this.publisher.connect().then(() => console.log('Publisher connected to a kafka broker'));

        this.subscriber = this.kafka.consumer({
            groupId: uuidv4(),
        });
        this.subscriber.connect().then(() => console.log('Subscriber connected to a kafka broker'));

        this.subscriber.subscribe({
            topic: this.changesTopic,
            fromBeginning: false,
        });

        this.subscriber.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                const key = message.key.toString();

                // Check if we are actually subscribed to this key's messages
                if (this.subscribedKeys.has(key)) {
                    this.callbacks.forEach((callback) => callback(key, message.value.toString()));
                }
            },
        });
    }

    disconnect(): void {
        this.subscriber.disconnect();
        this.publisher.disconnect();
    }
}
