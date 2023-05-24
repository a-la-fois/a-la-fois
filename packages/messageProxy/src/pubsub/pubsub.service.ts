import { KafkaService } from '@a-la-fois/nest-common';
import { Injectable } from '@nestjs/common';
import {
    awarenessBroadcastMessageType,
    BroadcastMessage,
    changesBroadcastMessageType,
    detachDocBroadcastMessageType,
    updateTokenBroadcastMessageType,
} from './types';
import { attachDocBroadcastMessageType } from './types/attachDocMessage';
import { disconnectBroadcastMessageType } from './types/disconnectMessage';

const MESSAGE_TYPE_TO_TOPIC: Record<BroadcastMessageTypes, string> = {
    [changesBroadcastMessageType]: 'changes',
    [awarenessBroadcastMessageType]: 'changes',
    [updateTokenBroadcastMessageType]: 'service',
    [detachDocBroadcastMessageType]: '',
    [attachDocBroadcastMessageType]: '',
    [disconnectBroadcastMessageType]: '',
};

export type BroadcastMessageTypes =
    | typeof changesBroadcastMessageType
    | typeof awarenessBroadcastMessageType
    | typeof updateTokenBroadcastMessageType
    | typeof detachDocBroadcastMessageType
    | typeof attachDocBroadcastMessageType
    | typeof disconnectBroadcastMessageType;

export type MessageSubscriber<TPayload> = (message: BroadcastMessage<BroadcastMessageTypes, TPayload>) => void;

@Injectable()
export class PubsubService {
    private subscribers: Map<BroadcastMessageTypes, MessageSubscriber<Object>[]> = new Map();

    constructor(private readonly kafka: KafkaService) {
        this.kafka.addCallback(this.onMessageRaw);
    }

    private onMessageRaw = (topic: string, message: string) => {
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