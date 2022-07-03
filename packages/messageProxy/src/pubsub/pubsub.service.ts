import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

type onPublishCallback = (channel: string, message: string) => void;

@Injectable()
export class PubsubService {
  private publisher: Redis;
  private subscriber: Redis;
  private callbacks: onPublishCallback[];

  constructor() {
    this.callbacks = [];
    this.publisher = new Redis();
    this.subscriber = new Redis();

    this.subscriber.on('message',
      (channel: string, message: string) => {
      this.callbacks.forEach(c => c(channel, message));
    })
  }

  publish(channel: string, message: string) {
    this.publisher.publish(channel, message);
  }

  addOnPublish(callback: onPublishCallback) {
    this.callbacks.push(callback);
  }

  subscribe(
    channel: string,
    callback: (err, count) => void = () => {console.log(`Subscribed to ${channel}`)}
  ) {
    this.subscriber.subscribe(channel, callback)
  }
}