import { Changes } from "../doc/types";
import { WebSocketClient } from '../ws/types';

export type BroadcastMessage = {
  author: WebSocketClient;
  changes: Changes;
};

export type onPublishCallback = (key: string, message: Changes) => void;

export interface Connectable {
  connect(): void

  disconnect(): void
}

export interface PubSub<Key, Message> extends Connectable {
  publish(key: Key, message: Message): void

  subscribe(key: Key): void

  unsubscribe(key: Key): void

  addCallback(callback: (Key, Message) => void)
}