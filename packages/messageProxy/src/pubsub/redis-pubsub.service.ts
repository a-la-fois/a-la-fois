import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { onPublishCallback, PubSub } from './types';

export const RedisPubSubToken = 'REDIS_PUBSUB';

@Injectable()
export class RedisPubsubService implements PubSub {
  private publisher: Redis;
  private subscriber: Redis;
  private callbacks: onPublishCallback[] = [];

  publish(channel: string, message: string) {
    this.publisher.publish(channel, message);
  }

  addOnPublish(callback: onPublishCallback) {
    this.callbacks.push(callback);
  }

  subscribe(channel: string) {
    this.subscriber.subscribe(
      channel,
      () => {
        console.log(`Subscribed to ${channel}`)
      },
    )
  }

  connect(): void {
    this.publisher = new Redis();
    this.subscriber = new Redis();

    this.subscriber.on('message',
      (channel: string, message: string) => {
        this.callbacks.forEach(c => c(channel, message));
      })
  }

  disconnect(): void {
    this.publisher.disconnect();
    this.subscriber.disconnect();
  }
}