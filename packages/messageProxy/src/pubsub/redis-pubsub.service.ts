import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { BroadcastMessage, onPublishCallback, PubSub } from './types';

export const RedisPubSubToken = 'REDIS_PUBSUB';

@Injectable()
export class RedisPubsubService implements PubSub<string> {
    private publisher: Redis;
    private subscriber: Redis;
    private callbacks: onPublishCallback[] = [];

    publish(channel: string, message: BroadcastMessage) {
        this.publisher.publish(channel, JSON.stringify(message));
    }

    addCallback(callback: onPublishCallback) {
        this.callbacks.push(callback);
    }

    subscribe(channel: string) {
        this.subscriber.subscribe(channel, () => {
            console.log(`Subscribed to ${channel}`);
        });
    }

    unsubscribe(key: string): void {
        this.subscriber.unsubscribe(key);
    }

    connect(): void {
        this.publisher = new Redis();
        this.subscriber = new Redis();

        this.subscriber.on('message', (channel: string, message: string) => {
            this.callbacks.forEach((c) => c(channel, message));
        });
    }

    disconnect(): void {
        this.publisher.disconnect();
        this.subscriber.disconnect();
    }
}
