import { readFileSync } from 'fs';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { CallbackType, KafkaOptions } from './types';
import { OPTIONS_TOKEN } from './constants';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

@Injectable()
export class KafkaService implements OnModuleDestroy {
    private topicsToSubscribe: string[];
    private publisher: Producer;
    private subscriber?: Consumer;
    private callbacks: CallbackType[] = [];
    private kafka: Kafka;

    constructor(@Inject(OPTIONS_TOKEN) private options: KafkaOptions) {
        this.topicsToSubscribe = this.options.topicsToSubscribe;

        this.kafka = new Kafka(this.buildParams(this.options));

        this.publisher = this.kafka.producer();
        this.publisher.connect().then(() => console.log('Publisher connected to a kafka broker'));

        if (this.topicsToSubscribe) {
            this.subscriber = this.kafka.consumer({
                groupId: uuidv4(),
            });
            this.subscriber.connect().then(() => console.log('Subscriber connected to a kafka broker'));

            this.subscriber.subscribe({
                topics: this.topicsToSubscribe,
                fromBeginning: false,
            });

            this.subscriber.run({
                eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                    if (!message.value) {
                        return;
                    }

                    for (const callback of this.callbacks) {
                        callback(topic, message.value.toString());
                    }
                },
            });
        }
    }

    private buildParams({ clientId, caPath, username, password, saslMechanism, hosts }: KafkaOptions) {
        // TODO: kafka config constructor
        const params = {};

        if (caPath) {
            params['ssl'] = {
                ca: [readFileSync(caPath)],
            };
        }

        if (username && password) {
            params['sasl'] = {
                saslMechanism,
                username,
                password,
            };
        }
        return {
            clientId: clientId,
            brokers: hosts,
            ...params,
        };
    }

    onModuleDestroy() {
        if (this.subscriber) {
            this.subscriber.disconnect();
        }

        this.publisher.disconnect();
    }

    publish(topic: string, message: string): void {
        this.publisher
            .send({
                topic: topic,
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
}
