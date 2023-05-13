import type { Changes } from '../messages';
import type { WebSocketClient } from '../ws/types';

export type broadcastMessageType = 'changes' | 'awareness';

export type BroadcastMessage = {
    author: WebSocketClient;
    type: broadcastMessageType;
    data: string;
};

export type OnPublishCallback = (key: string, message: Changes) => void;

export interface Connectable {
    connect(): void;

    disconnect(): void;
}

export interface PubSub<Topic> extends Connectable {
    publish(topic: Topic, key: string, message: BroadcastMessage): void;

    addCallback(topic: Topic, callback: OnPublishCallback): void;
}
