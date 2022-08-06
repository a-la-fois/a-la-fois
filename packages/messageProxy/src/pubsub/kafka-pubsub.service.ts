import { Injectable } from '@nestjs/common';
import { onPublishCallback, PubSub } from './types';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';


export const KafkaPubSubToken = 'KAFKA_PUBSUB';
const KAFKA_TOPIC = 'changes'


@Injectable()
export class KafkaPubsubService implements PubSub<string, string> {
  private kafka: Kafka;
  private publisher: Producer;
  private subscriber: Consumer;
  protected callbacks: onPublishCallback[] = [];
  private subscribedKeys: Set<string> = new Set<string>();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'messageProxy',
      brokers: ['kafka:9092'],
    });
  }

  publish(key: string, message: string): void {
    this.publisher.send({
      topic: KAFKA_TOPIC,
      messages: [{
        key: key,
        value: message,
      }],
    })
      // TODO: remove log
      .then(console.log)
      .catch(console.log);
  }

  subscribe(key: string): void {
    this.subscribedKeys.add(key);
  }

  unsubscribe(key: string): void {
    this.subscribedKeys.delete(key);
  }

  addCallback(callback: onPublishCallback) {
    this.callbacks.push(callback);
  }

  connect(): void {
    this.publisher = this.kafka.producer();
    this.subscriber = this.kafka.consumer({
      groupId: uuidv4(),
    });

    this.subscriber.connect()
      .then(() => console.log('Consumer connected to a kafka broker.'));
    this.publisher.connect()
      .then(() => console.log('Provider connected to a kafka broker.'));

    this.subscriber.subscribe({
      topic: KAFKA_TOPIC,
      fromBeginning: false,
    })

    this.subscriber.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const key = message.key.toString();

        // Check if we actually subscribed to this key's messages
        if (this.subscribedKeys.has(key)) {
          this.callbacks.forEach(
            callback => callback(key, message.value.toString())
          );
        }
      },
    })
  }

  disconnect(): void {
    this.subscriber.disconnect()
      .then(() => console.log('Consumer disconnected.'));
    this.publisher.disconnect()
      .then(() => console.log('Provider disconnected.'));
  }
}