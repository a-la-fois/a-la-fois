import { Injectable } from '@nestjs/common';
import { onPublishCallback, PubSub } from './types';
import { DocKey } from '../doc/types';
import { Changes } from '../messages';
import { Producer, KafkaConsumer } from 'node-rdkafka';
import { ConfigService } from '@nestjs/config';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

@Injectable()
export class KafkaPubsubService implements PubSub<DocKey, Changes> {
    private publisher: Producer;
    private subscriber: KafkaConsumer;
    protected callbacks: onPublishCallback[] = [];
    private subscribedKeys: Set<DocKey> = new Set<DocKey>();
    private changesTopic: string;

    constructor(private readonly configService: ConfigService) {
        this.changesTopic = this.configService.get<string>('kafka.changesTopic');
    }

    publish(key: DocKey, message: Changes): void {
        this.publisher.produce(this.changesTopic, null, Buffer.from(message), key);
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
        this.publisher = new Producer({
            'metadata.broker.list': this.configService.get<string>('kafka.host'),
            dr_cb: true,
        });

        this.publisher.connect();

        this.publisher.on('event.error', (err) => {
            console.error('Error from producer');
            console.error(err);
        });

        this.publisher.setPollInterval(this.configService.get<number>('kafka.pollInterval'));

        this.subscriber = new KafkaConsumer(
            {
                'group.id': 'kafka',
                'bootstrap.servers': this.configService.get<string>('kafka.host'),
            },
            {}
        );

        // TODO Wait for the publisher to connect
        this.subscriber.connect();

        this.subscriber
            .on('ready', () => {
                this.subscriber.subscribe([this.configService.get<string>('kafka.changesTopic')]);
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
        this.publisher.disconnect();
    }
}
