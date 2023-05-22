import { Injectable } from '@nestjs/common';
import { KafkaPubsubService, TopicKeys } from './kafka-pubsub.service';
import {
    awarenessBroadcastMessageType,
    BroadcastMessage,
    changesBroadcastMessageType,
    detachDocBroadcastMessageType,
    updateTokenBroadcastMessageType,
} from './types';

const MESSAGE_TYPE_TO_TOPIC: Record<BroadcastMessageTypes, TopicKeys> = {
    [changesBroadcastMessageType]: 'changes',
    [awarenessBroadcastMessageType]: 'changes',
    [updateTokenBroadcastMessageType]: 'service',
    [detachDocBroadcastMessageType]: 'service',
};

export type BroadcastMessageTypes =
    | typeof changesBroadcastMessageType
    | typeof awarenessBroadcastMessageType
    | typeof updateTokenBroadcastMessageType
    | typeof detachDocBroadcastMessageType;

export type MessageSubscriber<TPayload> = (message: BroadcastMessage<BroadcastMessageTypes, TPayload>) => void;

@Injectable()
export class PubsubService {
    private subscribers: Map<BroadcastMessageTypes, MessageSubscriber<Object>[]> = new Map();

    constructor(private readonly kafka: KafkaPubsubService) {
        this.kafka.addCallback(this.onMessageRaw);
    }

    private onMessageRaw = (message: string) => {
        const broadcastMessage: BroadcastMessage<BroadcastMessageTypes, Object> = JSON.parse(message);
        this.onMessage(broadcastMessage);
    };

    private onMessage = (message: BroadcastMessage<BroadcastMessageTypes, Object>) => {
        const subscribersByType = this.subscribers.get(message.type);

        if (!subscribersByType) {
            return;
        }

        for (const sub of subscribersByType) {
            sub(message);
        }
    };

    subscribe<T extends Object>(messageType: BroadcastMessageTypes, subscriber: MessageSubscriber<T>) {
        let subscribersByType = this.subscribers.get(messageType);

        if (subscribersByType) {
            subscribersByType.push(subscriber);
        } else {
            subscribersByType = [subscriber];
        }

        this.subscribers.set(messageType, subscribersByType);
    }

    publish(message: BroadcastMessage<BroadcastMessageTypes, Object>) {
        this.kafka.publish(MESSAGE_TYPE_TO_TOPIC[message.type], JSON.stringify(message.message));
    }

    publishInternal(message: BroadcastMessage<BroadcastMessageTypes, Object>) {
        this.onMessage(message);
    }
}
