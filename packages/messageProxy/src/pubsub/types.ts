import type { Changes } from '../messages';
import type { WebSocketClient } from '../ws/types';

export type broadcastMessageType = 'changes' | 'awareness';

export type BroadcastMessage = {
    author: WebSocketClient;
    type: broadcastMessageType;
    data: string;
};

export type onPublishCallback = (key: string, message: Changes) => void;

export interface Connectable {
    connect(): void;

    disconnect(): void;
}

export interface PubSub<Key> extends Connectable {
    publish(key: Key, message: BroadcastMessage): void;

    subscribe(key: Key): void;

    unsubscribe(key: Key): void;

    addCallback(callback: (Key, BroadcastMessage) => void);
}
