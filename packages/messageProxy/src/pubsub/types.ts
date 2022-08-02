import { Changes } from "../doc/types";
import { WebSocketClient } from '../ws/types';

export type BroadcastMessage = {
  author: WebSocketClient;
  changes: Changes;
};

export type onPublishCallback = (channel: string, message: string) => void;

export interface PubSub {
  publish(topic: string, message: string): void

  subscribe(topic: string): void

  addOnPublish(callback: onPublishCallback)
}