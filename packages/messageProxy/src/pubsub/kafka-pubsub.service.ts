import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { onPublishCallback, PubSub } from './types';
import { DocKey } from '../doc/types';
import { Changes } from '../messages';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

type sslParams = KafkaConfig['ssl'];

@Injectable()
export class KafkaPubsubService implements PubSub<DocKey, Changes> {
    private publisher: Producer;
    private subscriber: Consumer;
    protected callbacks: onPublishCallback[] = [];
    private subscribedKeys: Set<DocKey> = new Set<DocKey>();
    private changesTopic: string;
    private kafka: Kafka;

    constructor(private readonly configService: ConfigService) {
        this.changesTopic = this.configService.get<string>('kafka.changesTopic');

        const caCertPath: string = this.configService.get<string>('kafka.caPath');
        const username: string = this.configService.get<string>('kafka.username');
        const password: string = this.configService.get<string>('kafka.password');
        const mechanism: string = this.configService.get<string>('kafka.mechanism');

        let sslParams: sslParams = false;
        if (caCertPath) {
            sslParams = {
                ca: [readFileSync(caCertPath)],
            };
        }

        const saslParams = {
            sasl: {
                mechanism,
                username,
                password,
            },
        }
            ? username && password
            : {};

        this.kafka = new Kafka({
            clientId: 'messageProxy',
            brokers: this.configService.get<string>('kafka.host').split(','),
            ssl: {
                ...sslParams,
            },
            ...saslParams,
        });
    }

    publish(key: DocKey, message: Changes): void {
        this.publisher
            .send({
                topic: this.changesTopic,
                messages: [
                    {
                        key: key,
                        value: Buffer.from(message),
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
