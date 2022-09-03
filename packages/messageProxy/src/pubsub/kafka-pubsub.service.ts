import { Injectable } from '@nestjs/common';
import { onPublishCallback, PubSub } from './types';
import { DocKey } from '../doc/types';
import { Changes } from '../messages';
import { Producer, KafkaConsumer, ProducerStream } from 'node-rdkafka';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';
const KAFKA_TOPIC = 'changes';

@Injectable()
export class KafkaPubsubService implements PubSub<DocKey, Changes> {
    private publisherStream: ProducerStream;
    private subscriber: KafkaConsumer;
    protected callbacks: onPublishCallback[] = [];
    private subscribedKeys: Set<DocKey> = new Set<DocKey>();

    publish(key: DocKey, message: Changes): void {
        if (!this.publisherStream.write(Buffer.from(message))) {
            console.error('The queue has been filled up!');
        }
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
        this.publisherStream = Producer.createWriteStream(
            {
                'metadata.broker.list': 'kafka-host1:9092,kafka-host2:9092',
            },
            {},
            {
                topic: 'topic-name',
            }
        );

        this.publisherStream.on('error', function (err) {
            // Here's where we'll know if something went wrong sending to Kafka
            console.error('Error in our kafka stream');
            console.error(err);
        });

        this.subscriber = new KafkaConsumer(
            {
                'group.id': 'kafka',
                'bootstrap.servers': 'localhost:9092',
            },
            {}
        );

        // TODO Wait for the publisher to connect
        this.subscriber.connect();

        this.subscriber
            .on('ready', () => {
                this.subscriber.subscribe([KAFKA_TOPIC]);
                this.subscriber.consume();
            })
            .on('data', (data) => {
                console.log(data.key + ':' + data.value.toString());

                const key = data.key.toString();

                // Check if we are actually subscribed to this key's messages
                if (this.subscribedKeys.has(key)) {
                    this.callbacks.forEach((callback) => callback(key, data.value.toString()));
                }
            });
    }

    disconnect(): void {
        this.subscriber.disconnect();
        this.publisherStream.close();
    }
}
