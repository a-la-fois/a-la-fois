import { Injectable } from '@nestjs/common';
import { onPublishCallback, PubSub } from './types';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

export const KafkaPubSubToken = 'KAFKA_PUBSUB';

@Injectable()
export class KafkaPubsubService implements PubSub {
  private kafka: Kafka;
  private publisher: Producer;
  private subscriber: Consumer;
  protected callbacks: onPublishCallback[] = [];

  constructor() {
    this.kafka = new Kafka({
      clientId: 'messageProxy',
      brokers: ['kafka:9092'],
    });

    this.publisher = this.kafka.producer();
    this.subscriber = this.kafka.consumer({
      groupId: uuidv4(),
    });

    this.subscriber.connect()
      .then(() => console.log('Consumer connected to a kafka broker.'));
    this.publisher.connect()
      .then(() => console.log('Provider connected to a kafka broker.'));
  }

  publish(topic: string, message: string): void {
    this.publisher.send({
      topic,
      messages: [
        { value: message },
      ],
    })
      .then(console.log)
      .catch(console.log);
  }

  subscribe(topic: string): void {
    this.subscriber.subscribe({
      topic,
      fromBeginning: false,
    })
      .then(console.log)
      .catch(console.log);
  }

  addOnPublish(callback: onPublishCallback) {
    this.callbacks.push(callback);
  }
}